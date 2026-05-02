import express from "express";
import Driver from "../models/Driver.js";
import Team from "../models/Team.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { crewName, leaderName, discord, drivers } = req.body;

  if (!crewName || !leaderName || !discord) {
    return res.status(400).json({ message: "Team details are required" });
  }
  if (!Array.isArray(drivers) || drivers.length !== 5) {
    return res.status(400).json({ message: "Exactly 5 drivers are required" });
  }

  const mainCount = drivers.filter((driver) => driver.role === "Main").length;
  const reserveCount = drivers.filter((driver) => driver.role === "Reserve").length;
  if (mainCount !== 4 || reserveCount !== 1) {
    return res.status(400).json({ message: "Registration must include 4 Main drivers and 1 Reserve driver" });
  }

  const aliases = drivers.map((driver) => driver.alias?.trim().toLowerCase());
  if (new Set(aliases).size !== aliases.length) {
    return res.status(400).json({ message: "Duplicate driver aliases are not allowed" });
  }

  let createdTeam;
  try {
    createdTeam = await Team.create({ crewName, leaderName, discord });
    await Driver.insertMany(drivers.map((driver) => ({ ...driver, teamId: createdTeam._id })));
    res.status(201).json({ team: createdTeam });
  } catch (error) {
    if (createdTeam?._id) {
      await Team.findByIdAndDelete(createdTeam._id);
      await Driver.deleteMany({ teamId: createdTeam._id });
    }
    res.status(400).json({ message: error.code === 11000 ? "Team or driver already exists" : error.message });
  }
});

export default router;
