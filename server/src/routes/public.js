import express from "express";
import mongoose from "mongoose";
import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";
import { getLeaderboards } from "../services/scoring.js";

const router = express.Router();

/* -------------------- HELPERS -------------------- */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* -------------------- LEADERBOARDS -------------------- */
router.get("/leaderboards", async (_req, res) => {
  try {
    res.json(await getLeaderboards());
  } catch {
    res.status(500).json({ message: "Failed to load leaderboards" });
  }
});

/* -------------------- FIXTURES -------------------- */
router.get("/fixtures", async (_req, res) => {
  try {
    const fixtures = await Match.find({ isPublished: true })
      .populate("teams", "crewName points")
      .populate("participants.teamId", "crewName")
      .populate("participants.driverIds", "alias role status")
      .sort({ raceDate: 1, raceTime: 1, day: 1, slot: 1 });

    res.json(fixtures);
  } catch {
    res.status(500).json({ message: "Failed to load fixtures" });
  }
});

/* -------------------- TEAMS -------------------- */
router.get("/teams", async (_req, res) => {
  try {
    const teams = await Team.find({ status: "Approved" }).sort({ points: -1 });
    res.json(teams);
  } catch {
    res.status(500).json({ message: "Failed to load teams" });
  }
});

/* -------------------- DRIVERS -------------------- */
router.get("/drivers", async (_req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("teamId", "crewName")
      .sort({ ratingPoints: -1 });

    res.json(drivers);
  } catch {
    res.status(500).json({ message: "Failed to load drivers" });
  }
});

/* ======================================================
   🔥 POV SYSTEM (UPGRADED)
====================================================== */

/* -------------------- SUBMIT POV -------------------- */
router.post("/pov/submit", async (req, res) => {
  try {
    const { matchId, teamId, driverName, raceType, url } = req.body;

    // ❌ Basic validation
    if (!matchId || !teamId || !driverName || !raceType || !url) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isValidId(matchId) || !isValidId(teamId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // ❌ URL validation
    if (!url.startsWith("http")) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // ❌ Prevent duplicate POV (same driver + match)
    const alreadyExists = match.povs.some(
      (p) =>
        p.driverName.toLowerCase() === driverName.toLowerCase() &&
        String(p.teamId) === teamId
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "POV already submitted" });
    }

    match.povs.push({
      teamId,
      driverName: driverName.trim(),
      raceType,
      url: url.trim(),
      uploadedBy: "player"
    });

    await match.save();

    res.json({ message: "POV submitted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to submit POV" });
  }
});

/* -------------------- GET USER POV STATUS -------------------- */
router.get("/pov/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!isValidId(teamId)) {
      return res.status(400).json({ message: "Invalid team ID" });
    }

    const matches = await Match.find({
      "povs.teamId": teamId
    }).select("day type povs");

    const povs = matches.flatMap((m) =>
      m.povs
        .filter((p) => String(p.teamId) === teamId)
        .map((p) => ({
          matchId: m._id,
          day: m.day,
          raceType: p.raceType,
          driverName: p.driverName,
          url: p.url,
          status: p.status || "Pending",
          reviewReason: p.reviewReason || "",
          penalty: Boolean(p.penalty)
        }))
    );

    res.json(povs);
  } catch {
    res.status(500).json({ message: "Failed to fetch POVs" });
  }
});

export default router;