import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    alias: { type: String, required: true, trim: true },
    icName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    discord: { type: String, required: true, trim: true },
    role: { type: String, enum: ["Main", "Reserve"], required: true },
    status: { type: String, enum: ["Eligible", "Restricted", "Assigned"], default: "Eligible" },
    restrictionReason: { type: String, default: "" },
    ratingPoints: { type: Number, default: 0 },
    racePoints: { type: Number, default: 0 },
    racesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    podiums: { type: Number, default: 0 },
    totalPositions: { type: Number, default: 0 },
    assignments: [{ matchId: mongoose.Schema.Types.ObjectId, day: Number, type: String }]
  },
  { timestamps: true }
);

driverSchema.index({ teamId: 1, alias: 1 }, { unique: true });

export default mongoose.model("Driver", driverSchema);
