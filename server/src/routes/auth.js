import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "8h" });
  res.json({ token, username: admin.username });
});

export default router;
