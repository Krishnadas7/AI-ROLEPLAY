import express from "express";
import { startSession, sendMessage, endSession, getSessionHistory, getSessionDetails } from "../controllers/roleplayController.js";

const router = express.Router();

router.post("/session/start", startSession);
router.post("/session/end", endSession);
router.post("/message", sendMessage);
router.get("/session/history", getSessionHistory);
router.get("/session/:sessionId/details", getSessionDetails);

export default router;
