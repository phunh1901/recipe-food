import express from "express";
import {
  verifyToken,
  verifyAdmin,
  isSuperAdmin,
} from "../middlewares/authMiddlewares.js";
import {
  register,
  login,
  logout,
  forgotPassword,
  promoteToAdmin,
  demoteAdmin,
  banUser,
  unbanUser,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/forgot-password", forgotPassword);

// Only Admin
router.patch(
  "/make-admin/:id",
  verifyToken,
  verifyAdmin,
  isSuperAdmin,
  promoteToAdmin
);

router.patch(
  "/demote-admin/:id",
  verifyToken,
  verifyAdmin,
  isSuperAdmin,
  demoteAdmin
);

router.patch("/ban/:id", verifyToken, verifyAdmin, banUser);
router.patch("/unban/:id", verifyToken, verifyAdmin, unbanUser);

export default router;
