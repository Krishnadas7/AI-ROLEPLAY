import mongoose from "mongoose";

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  aiPersona: {
    name: String,
    age: Number,
    tone: String,
  },
}, { timestamps: true });

export const Scenario = mongoose.model("Scenario", scenarioSchema);