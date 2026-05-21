import express from "express";
import mongoose from "mongoose";
import AdminMessage from "../models/AdminMessage.js";
import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Penalty from "../models/Penalty.js";
import Team from "../models/Team.js";
import { requireAdmin } from "../middleware/auth.js";
import { assignDrivers, generateCustomFixtures, generateFixtures } from "../services/fixtures.js";
import { applyResults } from "../services/scoring.js";

const router = express.Router();
router.use(requireAdmin);


router.use((req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized admin access" });
  }

  // 🔒 STRICT STAFF RESTRICTION
  if (req.admin.role === "staff") {
    // Only allow safe GET endpoints
    const isAllowed = req.method === "GET" && (
      req.path === "/dashboard" ||
      req.path === "/povs" ||
      req.path === "/chat"
    );

    if (!isAllowed) {
      return res.status(403).json({ message: "Staff are only permitted to view POVs and Dashboard" });
    }
  }

  next();
});


async function buildParticipants(teamIds, raceType) {
  const limit = raceType === "Team" ? 4 : raceType === "Duo" ? 2 : 0;
  const participants = [];

  for (const teamId of teamIds) {
    const drivers = await Driver.find({ teamId }).sort({ role: 1, alias: 1 }).limit(limit);
    participants.push({ teamId, driverIds: drivers.map((driver) => driver._id) });
  }

  return participants;
}

function parseRaceDate(raceDate) {
  if (!raceDate) return undefined;
  const date = new Date(raceDate);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function cleanTeamIds(teamIds) {
  return Array.isArray(teamIds) ? teamIds.filter(Boolean) : [];
}

router.get("/dashboard", async (_req, res) => {
  try {
    const [teams, drivers, matches, penalties] = await Promise.all([
      Team.find().sort({ createdAt: -1 }).lean(),
      Driver.find().populate("teamId", "crewName").sort({ alias: 1 }).lean(),
      Match.find()
        .populate("teams", "crewName")
        .populate("participants.driverIds", "alias status role")
        .sort({ raceDate: 1, raceTime: 1, day: 1, slot: 1 })
        .lean(),
      Penalty.find()
        .populate("teamId", "crewName")
        .populate("driverId", "alias")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    res.json({ teams, drivers, matches, penalties });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});


router.patch("/teams/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Normalize input (avoid "approved", "APPROVED", etc.)
    const normalizedStatus =
      typeof status === "string" ? status.trim() : "";

    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    // ❌ Validate input
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    // ❌ Validate ID format (prevents Mongo crash)
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid team ID"
      });
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { status: normalizedStatus },
      { new: true }
    );

    // ❌ Check if team exists
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (err) {
  console.error("❌ TEAM STATUS ERROR:", err);
  res.status(500).json({ message: "Failed to update status" });
}
});

router.get("/chat", async (_req, res) => {
  try {
    const messages = await AdminMessage.find().sort({ createdAt: -1 }).limit(80);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: "Failed to load chat" });
  }
});
router.post("/chat", async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();

    // ❌ Empty message
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // ❌ Too long (basic spam control)
    if (message.length > 300) {
      return res.status(400).json({ message: "Message too long (max 300 chars)" });
    }

    const created = await AdminMessage.create({
      author: req.admin?.username || req.admin?.id || "admin",
      message
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.post("/fixtures/generate", async (req, res) => {
  try {
    const fixtures = await generateCustomFixtures(req.body);
    res.status(201).json(fixtures);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/fixtures/publish", async (_req, res) => {
  try {
    const result = await Match.updateMany(
      { status: "Pending" },
      { $set: { isPublished: true } }
    );

    res.json({
      message: "Fixtures published successfully",
      published: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to publish fixtures" });
  }
});

router.post("/fixtures/unpublish", async (_req, res) => {
  try {
    const result = await Match.updateMany(
      { status: "Pending" },
      { $set: { isPublished: false } }
    );

    res.json({
      message: "Fixtures unpublished successfully",
      unpublished: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to unpublish fixtures" });
  }
});

router.post("/matches", async (req, res) => {
  try {
    const teamIds = cleanTeamIds(req.body.teamIds);
    const type = req.body.type || "Team";
    if (["Solo", "Rivalry"].includes(type) && teamIds.length !== 2) {
      return res.status(400).json({ message: `${type === "Solo" ? "Solo Showdown" : "Rivalry Clash"} requires exactly 2 teams` });
    }
    if (teamIds.length < 1) return res.status(400).json({ message: "Select at least one team" });

   const day = Math.max(1, Number(req.body.day) || 1);
const slot = Math.max(1, Number(req.body.slot) || 1);

const match = await Match.create({
  day,
  slot,

  raceDate:
    req.body.raceDate !== undefined
      ? parseRaceDate(req.body.raceDate)
      : undefined,

  raceTime:
    req.body.raceTime !== undefined
      ? String(req.body.raceTime).trim()
      : "",

  trackName:
    req.body.trackName !== undefined
      ? String(req.body.trackName).trim()
      : "",

  carName:
    req.body.carName !== undefined
      ? String(req.body.carName).trim()
      : "",

  type,

  teams: teamIds,

  participants: await buildParticipants(teamIds, type),

  notes:
    req.body.notes !== undefined
      ? String(req.body.notes).trim()
      : "",

  isPublished: Boolean(req.body.isPublished)
});

    const populated = await Match.findById(match._id).populate("teams", "crewName").populate("participants.driverIds", "alias status role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/matches/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status === "Completed") return res.status(400).json({ message: "Completed fixtures cannot be edited here" });

    const teamIds = req.body.teamIds ? cleanTeamIds(req.body.teamIds) : match.teams.map(String);
    const type = req.body.type || match.type;
    if (["Solo", "Rivalry"].includes(type) && teamIds.length !== 2) {
      return res.status(400).json({ message: `${type === "Solo" ? "Solo Showdown" : "Rivalry Clash"} requires exactly 2 teams` });
    }
    if (teamIds.length < 1) return res.status(400).json({ message: "Select at least one team" });

    if (req.body.day !== undefined) {
  match.day = Math.max(1, Number(req.body.day) || match.day);
}
if (req.body.slot !== undefined) {
  match.slot = Math.max(1, Number(req.body.slot) || match.slot);
}
    if (req.body.raceDate !== undefined) {
  match.raceDate = parseRaceDate(req.body.raceDate);
}
if (req.body.raceTime !== undefined) {
  match.raceTime = req.body.raceTime;
}
if (req.body.trackName !== undefined) {
  match.trackName = req.body.trackName;
}
if (req.body.carName !== undefined) {
  match.carName = req.body.carName;
}
    match.type = type;
    match.teams = teamIds;
    match.participants = await buildParticipants(teamIds, type);
    if (req.body.notes !== undefined) {
  match.notes = String(req.body.notes).trim();
}
    match.isPublished = Boolean(req.body.isPublished);
    await match.save();

    const populated = await Match.findById(match._id).populate("teams", "crewName").populate("participants.driverIds", "alias status role");
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/matches/:id/assign", async (req, res) => {
  try {
    const { participants } = req.body;

    // ❌ Validate structure
    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        message: "Participants must be a non-empty array"
      });
    }

    // ❌ Validate each participant entry
    for (const p of participants) {
      if (!p.teamId || !Array.isArray(p.driverIds)) {
        return res.status(400).json({
          message: "Each participant must have teamId and driverIds[]"
        });
      }
    }

    // ❌ Validate match ID format (avoid Mongo crash)
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid match ID"
      });
    }

    const match = await assignDrivers(req.params.id, participants);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to assign drivers"
    });
  }
});


router.patch("/teams/:id", async (req, res) => {
  try {
    const { crewName, leaderName, points } = req.body;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        ...(crewName !== undefined && { crewName }),
...(leaderName !== undefined && { leaderName }),
...(points !== undefined && { points: Math.max(0, Number(points) || 0) })
      },
      { new: true }
    );

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Failed to update team" });
  }
});



router.delete("/teams/:id", async (req, res) => {
  try {
    const teamId = req.params.id;

    // ✅ Check if team exists FIRST
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ Delete all drivers of this team
    await Driver.deleteMany({ teamId });

    // ✅ Remove team from match teams array
    await Match.updateMany(
      { teams: teamId },
      { $pull: { teams: teamId } }
    );

    // ✅ Remove team from participants
    await Match.updateMany(
      { "participants.teamId": teamId },
      { $pull: { participants: { teamId } } }
    );

    // ✅ Finally delete team
    await Team.findByIdAndDelete(teamId);

    res.json({ message: "Team deleted safely" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});


router.post("/matches/:id/results", async (req, res) => {
  try {
    const { results } = req.body;

    // ❌ Basic validation
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        message: "Results must be a non-empty array"
      });
    }

    // ❌ Validate each result entry
    for (const r of results) {
      if (!r.teamId || typeof r.position !== "number") {
        return res.status(400).json({
          message: "Each result must include teamId and numeric position"
        });
      }

      if (r.position < 1) {
        return res.status(400).json({
          message: "Position must be >= 1"
        });
      }
    }

    const match = await applyResults(req.params.id, results);

    res.json(match);
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to apply results"
    });
  }
});


router.post("/penalties", async (req, res) => {
  try {
    let {
      teamId,
      driverId,
      matchId,
      type,
      pointsDelta = 0,
      restrictionDays = 0,
      reason
    } = req.body;

    // ❌ Basic validation
    if (!teamId || !type) {
      return res.status(400).json({ message: "teamId and type are required" });
    }

    // ✅ Clamp points to safe range
    const safePoints = Math.max(-1000, Math.min(1000, Number(pointsDelta) || 0));

    // ✅ Clamp restriction days
    const safeDays = Math.max(0, Math.min(30, Number(restrictionDays) || 0));

    const penalty = await Penalty.create({
      teamId,
      driverId,
      matchId,
      type,
      pointsDelta: safePoints,
      restrictionDays: safeDays,
      reason: reason ? String(reason).trim() : ""
    });

    // ✅ Apply team points safely
    if (safePoints) {
      await Team.findByIdAndUpdate(teamId, { $inc: { points: safePoints } });
    }

    // ✅ Apply driver restriction
    if (driverId && (type === "Player Restriction" || safeDays > 0)) {
      await Driver.findByIdAndUpdate(driverId, {
        status: "Restricted",
        restrictionReason:
          reason || `Restricted for ${safeDays} day(s)`
      });
    }

    res.status(201).json(penalty);
  } catch (err) {
    res.status(500).json({ message: "Failed to apply penalty" });
  }
});

router.post("/rivalry", async (req, res) => {
  try {
    let { day, slot = 99, teamIds, driverIds = [], betPoints = 0 } = req.body;

    // ❌ Validate teams
    if (!Array.isArray(teamIds) || teamIds.length !== 2) {
      return res.status(400).json({
        message: "Rivalry Clash requires exactly 2 teams"
      });
    }

    // ✅ Safe numbers
    const safeDay = Math.max(1, Number(day) || 1);
    const safeSlot = Math.max(1, Number(slot) || 99);
    const safeBet = Math.max(0, Number(betPoints) || 0);

    // ❌ Prevent same team vs itself (yes, people try this)
    if (String(teamIds[0]) === String(teamIds[1])) {
      return res.status(400).json({
        message: "A team cannot challenge itself"
      });
    }

    // ❌ Validate driverIds (optional but safe)
    const participants = teamIds.map((teamId, index) => {
      const driverId = driverIds[index];

      return {
        teamId,
        driverIds: driverId ? [driverId] : []
      };
    });

    const match = await Match.create({
      day: safeDay,
      slot: safeSlot,
      type: "Rivalry",
      teams: teamIds,
      betPoints: safeBet,
      participants
    });

    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ message: "Failed to create rivalry match" });
  }
});

// ================= POV MODERATION =================

// GET ALL POVs (grouped by match)
router.get("/povs", async (req, res) => {
  try {
    const { day, status } = req.query;

    const matches = await Match.find()
      .populate("povs.teamId", "crewName")
      .sort({ day: 1 })
      .lean();

    const formatted = matches
      .filter(m => !day || m.day == day)
      .map(match => ({
        matchId: match._id,
        day: match.day,
        type: match.type,
        povs: match.povs
          .filter(p => !status || p.status === status)
          .map(p => ({
            _id: p._id,
            driverName: p.driverName,
            driverId: p.driverId || null,
            teamId: p.teamId?._id,
            teamName: p.teamId?.crewName || "Unknown",
            url: p.url,
            status: p.status,
            penalty: p.penalty,
            createdAt: p.createdAt
          }))
      }));

    res.json(formatted);
  } catch {
    res.status(500).json({ message: "Failed to load POVs" });
  }
});


// UPDATE POV STATUS
router.patch("/povs/:matchId/:povId", async (req, res) => {
  try {
    const { matchId, povId } = req.params;
    const { status, penalty } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const pov = match.povs.id(povId);
    if (!pov) return res.status(404).json({ message: "POV not found" });

    // ✅ STATUS UPDATE
    if (status) {
      const allowed = ["Pending", "Approved", "Rejected", "On Hold"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      pov.status = status;
    }

    // ✅ APPLY PENALTY (ONLY ONCE)
    if (typeof penalty === "boolean") {
      if (penalty === true && !pov.penalty) {
        await Team.findByIdAndUpdate(pov.teamId, {
          $inc: { points: -5 } // change value if needed
        });
      }
      pov.penalty = penalty;
    }

    await match.save();

    res.json({ message: "POV updated successfully" });
  } catch {
    res.status(500).json({ message: "Failed to update POV" });
  }
});


router.patch("/drivers/:id", async (req, res) => {
  try {
    const { alias, icName, phone, discord, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (alias !== undefined) driver.alias = alias;
    if (icName !== undefined) driver.icName = icName;
    if (phone !== undefined) driver.phone = phone;
    if (discord !== undefined) driver.discord = discord;
    if (role !== undefined) driver.role = role;

    await driver.save();

    res.json({ message: "Driver updated successfully", driver });
  } catch (err) {
    console.error("🔥 DRIVER UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.patch("/drivers/:id/status", async (req, res) => {
  try {
    const { status, reason = "" } = req.body;

    const allowedStatuses = [
      "Eligible",
      "Restricted",
      "Disqualified",
      "Banned",
      "Penalized"
    ];

    // ✅ Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    // 🔍 Get driver
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // ❌ Prevent useless update
    const normalizedStatus = String(status).trim();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (driver.status === normalizedStatus) {
      return res.status(400).json({ message: `Driver already ${normalizedStatus}` });
    }

    driver.status = normalizedStatus;

    // 🔥 STATUS LOGIC
    let pointsDelta = 0;

    if (status === "Penalized") {
      pointsDelta = -5;
    }

    if (status === "Disqualified") {
      pointsDelta = -10;
    }

    if (status === "Banned") {
      pointsDelta = -20;
    }

    // 🔥 Apply penalty if needed
    if (pointsDelta !== 0 && driver.teamId) {
      const teamId = typeof driver.teamId === "object"
        ? driver.teamId._id
        : driver.teamId;

      await Team.findByIdAndUpdate(teamId, {
        $inc: { points: pointsDelta }
      });

      await Penalty.create({
        teamId,
        driverId: driver._id,
        type: status,
        pointsDelta,
        reason: reason || `Auto penalty: ${status}`
      });
    }

    // 🔄 Update driver
    driver.markModified("status");
    await driver.save();

    // ✅ Response
    res.json({
      message: `Driver ${driver.alias} marked as ${status}`,
      driver
    });

  } catch (err) {
    console.error("🔥 DRIVER STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
