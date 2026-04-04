import express from "express";
import { startSession, sendMessage, endSession } from "../controllers/roleplayController.js";

const router = express.Router();

router.post("/session/start", startSession);
router.post("/session/end", endSession);
router.post("/message", sendMessage);

export default router;
