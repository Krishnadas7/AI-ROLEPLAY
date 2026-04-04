import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  const dbUrl =
    config.USE_DB === "production"
      ? config.DB_CLUSTER
      : config.DB_LOCAL;

  try {
    await mongoose.connect(dbUrl);

    console.log(`✅ MongoDB connected (${config.USE_DB})`);

  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1); // stop app if DB fails
  }
};