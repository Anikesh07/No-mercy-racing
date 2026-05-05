import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin.js";

dotenv.config();

const adminsToSeed = [
  {
    username: process.env.ADMIN_USERNAME || "NMRL_admin",
    password: process.env.ADMIN_PASSWORD || "admin_068@ye"
  },
  {
    username: process.env.HIDDEN_ADMIN_USERNAME || "Anni",
    password: process.env.HIDDEN_ADMIN_PASSWORD || "Anni1207"
  }
];

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nmrl");

for (const admin of adminsToSeed) {
  const passwordHash = await bcrypt.hash(admin.password, 12);
  await Admin.findOneAndUpdate(
    { username: admin.username },
    { username: admin.username, passwordHash },
    { upsert: true, new: true }
  );
  console.log(`Admin seeded: ${admin.username}`);
}

await mongoose.disconnect();
