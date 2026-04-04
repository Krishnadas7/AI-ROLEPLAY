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
    relevance: Number,
    clarity: Number,
    completeness: Number,
    confidence: Number,
  },

  feedback: {
    relevance: String,
    clarity: String,
    completeness: String,
    confidence: String,
  },

  summary: String,
}, { timestamps: true });

export const Score = mongoose.model("Score", scoreSchema);