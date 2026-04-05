import express from "express";
import { startSession, endSession, getSessionHistory, getSessionDetails } from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start", startSession);
router.post("/end", endSession);
router.get("/history", getSessionHistory);
router.get("/:sessionId/details", getSessionDetails);

export default router;
