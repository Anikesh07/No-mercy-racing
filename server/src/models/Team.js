import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    crewName: { type: String, required: true, unique: true, trim: true },
    leaderName: { type: String, required: true, trim: true },
    discord: { type: String, required: true, trim: true },
    points: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    defensivePassUsed: { type: Boolean, default: false },
    swapsUsed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
