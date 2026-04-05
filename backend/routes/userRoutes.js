import express from "express";
import { identifyUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/identify", identifyUser);

export default router;
