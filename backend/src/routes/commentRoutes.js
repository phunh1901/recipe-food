import express from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controller/commentController.js";

const router = express.Router();

router.post("/:recipeId", verifyToken, addComment);
router.get("/:recipeId", getComments);
router.put("/:commentId", verifyToken, updateComment);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
