import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    driverIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }]
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    position: { type: Number, required: true },
    disqualified: { type: Boolean, default: false },
    disconnected: { type: Boolean, default: false }
  },
  { _id: false }
);

const povSchema = new mongoose.Schema(
  {
    // 🔗 optional link to registered driver
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },

    // 🧾 manual entry (for player submissions)
    driverName: { type: String, required: true, trim: true },

    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },

    raceType: {
      type: String,
      enum: ["Team", "Duo", "Solo", "Rivalry"],
      required: true
    },

    url: { type: String, required: true, trim: true },

    // 🔥 moderation system
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "On Hold"],
      default: "Pending"
    },

    reviewReason: { type: String, default: "" },

    penalty: { type: Boolean, default: false },

    uploadedBy: {
      type: String,
      enum: ["admin", "player"],
      default: "player"
    },

    createdAt: { type: Date, default: Date.now }
  },
  { _id: true } // IMPORTANT: allow updating individual POVs
);

const matchSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1, max: 30 },
    raceDate: { type: Date },
    raceTime: { type: String, default: "" },
    trackName: { type: String, default: "", trim: true },
    carName: { type: String, default: "", trim: true },
    slot: { type: Number, default: 1 },
    type: { type: String, enum: ["Team", "Duo", "Solo", "Rivalry"], required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    participants: [participantSchema],
    results: [resultSchema],
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    betPoints: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    povs: [povSchema]
  },
  { timestamps: true }
);

matchSchema.index({ _id: 1, "povs.driverId": 1 }, { unique: false });

export default mongoose.model("Match", matchSchema);
