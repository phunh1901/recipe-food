import { requireRecipeAccess } from "../middlewares/recipeAccess.js";
import express from "express";
import upload from "../middlewares/multer.js";
import { verifyToken, verifyAdmin, optionalVerifyToken } from "../middlewares/authMiddlewares.js";

import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeById,
  getRecipesByCategory,
  searchRecipesByName,
  toggleFavorite,
  getFavoritesRecipeOfUser,
  requestPublicRecipe,
  getMyRecipes,
  getPendingRecipes,
  approveRecipe,
  getPublicRecipesByUser,
  deleteRecipeImage,
} from "../controller/recipeController.js";

const router = express.Router();

router.post("/create", verifyToken, upload.single("image"), createRecipe);
router.put("/update/:id", verifyToken, upload.single("image"), updateRecipe);
router.delete("/delete/:id", verifyToken, deleteRecipe);
router.delete("/:id/image", verifyToken, deleteRecipeImage);
router.get("/all-recipes", getAllRecipes);
router.get("/category/:categoryId", getRecipesByCategory);
router.get("/detail-recipe/:id", optionalVerifyToken, requireRecipeAccess, getRecipeById);
router.get("/search", searchRecipesByName);
router.put("/bookmark/:recipeId", verifyToken, requireRecipeAccess, toggleFavorite);
router.get("/favorite", verifyToken, getFavoritesRecipeOfUser);
router.patch("/request-public/:recipeId", verifyToken, requestPublicRecipe);
router.get("/my-recipes", verifyToken, getMyRecipes);
router.get("/favorite/:targetUserId", verifyToken, getFavoritesRecipeOfUser);
router.get("/public-user/:userId", getPublicRecipesByUser);

// Chỉ admin
router.patch("/admin/approve", verifyToken, verifyAdmin, approveRecipe);
router.get("/admin/list-pending", verifyToken, verifyAdmin, getPendingRecipes);

export default router;
