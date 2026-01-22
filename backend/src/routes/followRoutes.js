import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddlewares.js";

import {
  toggleFollow,
  getMyFollowers,
  getMyFollowing,
} from "../controller/followController.js";

const router = express.Router();

router.post("/:followingId", verifyToken, toggleFollow);
router.get("/my-follower", verifyToken, getMyFollowers);
router.get("/my-following", verifyToken, getMyFollowing);
router.get("/follower/:userId", verifyToken, getMyFollowers);
router.get("/following/:userId", verifyToken, getMyFollowing);

// Chỉ admin
router.get("/admin/my-follower", verifyToken, verifyAdmin, getMyFollowers);
router.get("/admin/my-following", verifyToken, verifyAdmin, getMyFollowing);

export default router;
