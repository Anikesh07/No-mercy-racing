import express from "express";
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
  const [teams, drivers, matches, penalties] = await Promise.all([
    Team.find().sort({ createdAt: -1 }),
    Driver.find().populate("teamId", "crewName").sort({ alias: 1 }),
    Match.find().populate("teams", "crewName").populate("participants.driverIds", "alias status role").sort({ raceDate: 1, raceTime: 1, day: 1, slot: 1 }),
    Penalty.find().populate("teamId", "crewName").populate("driverId", "alias").sort({ createdAt: -1 })
  ]);
  res.json({ teams, drivers, matches, penalties });
});

router.patch("/teams/:id/status", async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(team);
});

router.get("/chat", async (_req, res) => {
  const messages = await AdminMessage.find().sort({ createdAt: -1 }).limit(80);
  res.json(messages.reverse());
});

router.post("/chat", async (req, res) => {
  const message = String(req.body.message || "").trim();
  if (!message) return res.status(400).json({ message: "Message is required" });

  const created = await AdminMessage.create({
    author: req.admin?.username || "admin",
    message
  });
  res.status(201).json(created);
});

router.post("/fixtures/generate", async (req, res) => {
  try {
    const fixtures = req.body?.teamCount ? await generateCustomFixtures(req.body) : await generateFixtures();
    res.status(201).json(fixtures);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/fixtures/publish", async (_req, res) => {
  const result = await Match.updateMany({ status: "Pending" }, { $set: { isPublished: true } });
  res.json({ published: result.modifiedCount });
});

router.post("/fixtures/unpublish", async (_req, res) => {
  const result = await Match.updateMany({ status: "Pending" }, { $set: { isPublished: false } });
  res.json({ unpublished: result.modifiedCount });
});

router.post("/matches", async (req, res) => {
  try {
    const teamIds = cleanTeamIds(req.body.teamIds);
    const type = req.body.type || "Team";
    if (["Solo", "Rivalry"].includes(type) && teamIds.length !== 2) {
      return res.status(400).json({ message: `${type === "Solo" ? "Solo Showdown" : "Rivalry Clash"} requires exactly 2 teams` });
    }
    if (teamIds.length < 1) return res.status(400).json({ message: "Select at least one team" });

    const match = await Match.create({
      day: Number(req.body.day) || 1,
      slot: Number(req.body.slot) || 1,
      raceDate: parseRaceDate(req.body.raceDate),
      raceTime: req.body.raceTime || "",
      trackName: req.body.trackName || "",
      carName: req.body.carName || "",
      type,
      teams: teamIds,
      participants: await buildParticipants(teamIds, type),
      notes: req.body.notes || "",
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

    match.day = Number(req.body.day) || match.day;
    match.slot = Number(req.body.slot) || match.slot;
    match.raceDate = parseRaceDate(req.body.raceDate);
    match.raceTime = req.body.raceTime || "";
    match.trackName = req.body.trackName || "";
    match.carName = req.body.carName || "";
    match.type = type;
    match.teams = teamIds;
    match.participants = await buildParticipants(teamIds, type);
    match.notes = req.body.notes || "";
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
    const match = await assignDrivers(req.params.id, req.body.participants);
    res.json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/matches/:id/results", async (req, res) => {
  try {
    const match = await applyResults(req.params.id, req.body.results);
    res.json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/matches/:id/povs", async (req, res) => {
  const { driverId, url } = req.body;
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ message: "Match not found" });
  if (match.povs.some((pov) => String(pov.driverId) === String(driverId))) {
    return res.status(400).json({ message: "POV already uploaded for this driver and match" });
  }
  match.povs.push({ driverId, url });
  await match.save();
  res.status(201).json(match);
});

router.post("/penalties", async (req, res) => {
  const { teamId, driverId, matchId, type, pointsDelta = 0, restrictionDays = 0, reason } = req.body;
  const penalty = await Penalty.create({ teamId, driverId, matchId, type, pointsDelta, restrictionDays, reason });
  if (pointsDelta) await Team.findByIdAndUpdate(teamId, { $inc: { points: pointsDelta } });
  if (driverId && (type === "Player Restriction" || restrictionDays > 0)) {
    await Driver.findByIdAndUpdate(driverId, {
      status: "Restricted",
      restrictionReason: reason || `Restricted for ${restrictionDays} day(s)`
    });
  }
  res.status(201).json(penalty);
});

router.post("/rivalry", async (req, res) => {
  const { day, slot = 99, teamIds, driverIds = [], betPoints = 0 } = req.body;
  if (!Array.isArray(teamIds) || teamIds.length !== 2) {
    return res.status(400).json({ message: "Rivalry Clash requires exactly 2 teams" });
  }
  const match = await Match.create({
    day,
    slot,
    type: "Rivalry",
    teams: teamIds,
    betPoints,
    participants: teamIds.map((teamId, index) => ({ teamId, driverIds: driverIds[index] ? [driverIds[index]] : [] }))
  });
  res.status(201).json(match);
});

export default router;
