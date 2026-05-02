import mongoose from "mongoose";

const penaltySchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
    type: {
      type: String,
      enum: ["Warning", "Dirty Driving", "Disqualification", "Team Deduction", "Player Restriction", "Refusal", "Wrong Participation"],
      required: true
    },
    pointsDelta: { type: Number, default: 0 },
    restrictionDays: { type: Number, default: 0 },
    reason: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Penalty", penaltySchema);
