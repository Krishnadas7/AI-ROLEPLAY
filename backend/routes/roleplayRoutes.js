import express from "express";
import { identifyUser, sendMessage } from "../controllers/roleplayController.js";

const router = express.Router();

router.post("/user/identify", identifyUser);
router.post("/message", sendMessage);

export default router;
