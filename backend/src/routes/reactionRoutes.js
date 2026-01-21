import express from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";
import { reactRecipe, getReactions } from "../controller/reactionController.js";

const router = express.Router();

router.post("/:id", verifyToken, reactRecipe);
router.get("/:id", getReactions);

export default router;
