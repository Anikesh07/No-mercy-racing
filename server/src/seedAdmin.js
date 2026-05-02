import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin.js";

dotenv.config();

const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "admin123";

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nmrl");

const passwordHash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate({ username }, { username, passwordHash }, { upsert: true, new: true });

console.log(`Admin ready: ${username}`);
await mongoose.disconnect();
