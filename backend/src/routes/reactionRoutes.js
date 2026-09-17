import { requireRecipeAccess } from "../middlewares/recipeAccess.js";
import express from "express";
import { verifyToken, optionalVerifyToken } from "../middlewares/authMiddlewares.js";
import { reactRecipe, getReactions } from "../controller/reactionController.js";

const router = express.Router();

router.post("/:id", verifyToken, requireRecipeAccess, reactRecipe);
router.get("/:id", optionalVerifyToken, requireRecipeAccess, getReactions);

export default router;
