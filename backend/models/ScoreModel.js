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
    communication: Number,
    empathy: Number,
    processKnowledge: Number,
    problemSolving: Number,
  },

  feedback: {
    communication: String,
    empathy: String,
    processKnowledge: String,
    problemSolving: String,
  },

  summary: String,
}, { timestamps: true });

export const Score = mongoose.model("Score", scoreSchema);