import mongoose from "mongoose";

const adminMessageSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export default mongoose.model("AdminMessage", adminMessageSchema);
