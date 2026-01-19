import express from "express";
/** @type {express.Router} */
import upload from "../middlewares/multer.js";
import {
  verifyToken,
  verifyAdmin,
  isSuperAdmin,
  optionalVerifyToken,
} from "../middlewares/authMiddlewares.js";
import {
  getMyProfile,
  selfDeleteAccount,
  changePassword,
  updateUser,
  getUserPublicProfile,
  getUserById,
  adminDeleteUser,
  getAllUsers,
  searchUsers,
  adminUpdateUser,
  getAdminStats,
  deleteAvatar,
} from "../controller/userController.js";

const router = express.Router();
router.get("/myProfile", verifyToken, getMyProfile);
router.get("/userProfile/:id", optionalVerifyToken, getUserPublicProfile);
router.delete("/delete", verifyToken, selfDeleteAccount);
router.patch("/change-password", verifyToken, changePassword);
router.put("/update", verifyToken, upload.single("image"), updateUser);
router.delete("/avatar", verifyToken, deleteAvatar);
router.get("/search", searchUsers);

// admin
router.get("/admin/all", verifyToken, verifyAdmin, getAllUsers);
router.get("/admin/user/:id", verifyToken, verifyAdmin, getUserById);
router.put(
  "/admin/updateuser/:id",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  adminUpdateUser
);
router.delete("/admin/delete/:id", verifyToken, verifyAdmin, adminDeleteUser);
router.get("/admin/stats", verifyToken, verifyAdmin, getAdminStats);

export default router;
