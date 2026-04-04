import express from "express";
import { startSession, sendMessage } from "../controllers/roleplayController.js";

const router = express.Router();

router.post("/session/start", startSession);
router.post("/message", sendMessage);

export default router;
