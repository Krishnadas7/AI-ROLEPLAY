import express from "express";
import { identifyUser, startSession, sendMessage, endSession, getSessionHistory, getSessionDetails } from "../controllers/roleplayController.js";

const router = express.Router();

router.post("/user/identify", identifyUser);
router.post("/session/start", startSession);
router.post("/session/end", endSession);
router.post("/message", sendMessage);
router.get("/session/history", getSessionHistory);
router.get("/session/:sessionId/details", getSessionDetails);

export default router;
