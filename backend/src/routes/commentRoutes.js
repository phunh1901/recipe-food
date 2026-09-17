import { requireRecipeAccess } from "../middlewares/recipeAccess.js";
import express from "express";
import { verifyToken, optionalVerifyToken } from "../middlewares/authMiddlewares.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controller/commentController.js";

const router = express.Router();

router.post("/:recipeId", verifyToken, requireRecipeAccess, addComment);
router.get("/:recipeId", optionalVerifyToken, requireRecipeAccess, getComments);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
