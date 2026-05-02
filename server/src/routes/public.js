import express from "express";
import Driver from "../models/Driver.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";
import { getLeaderboards } from "../services/scoring.js";

const router = express.Router();

router.get("/leaderboards", async (_req, res) => {
  res.json(await getLeaderboards());
});

router.get("/fixtures", async (_req, res) => {
  const fixtures = await Match.find({ isPublished: true })
    .populate("teams", "crewName points")
    .populate("participants.teamId", "crewName")
    .populate("participants.driverIds", "alias role status")
    .sort({ raceDate: 1, raceTime: 1, day: 1, slot: 1 });
  res.json(fixtures);
});

router.get("/teams", async (_req, res) => {
  const teams = await Team.find({ status: "Approved" }).sort({ points: -1 });
  res.json(teams);
});

router.get("/drivers", async (_req, res) => {
  const drivers = await Driver.find().populate("teamId", "crewName").sort({ ratingPoints: -1 });
  res.json(drivers);
});

export default router;
