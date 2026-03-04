import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  method: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: Number },
  duration: { type: Number },
  date: { type: Date, default: Date.now },
});

export = mongoose.models.History ||
  mongoose.model("History", HistorySchema);