// models/scoreModel.js
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },

  overallScore: {
    type: Number,
    required: true,
  },

  criteria: {
    protocolAdherence: Number,
    problemSolving: Number,
    empathyAndTone: Number,
    timeEfficiency: Number,
  },

  feedback: {
    protocolAdherence: String,
    problemSolving: String,
    empathyAndTone: String,
    timeEfficiency: String,
  },

  summary: String,
}, { timestamps: true });

export const Score = mongoose.model("Score", scoreSchema);