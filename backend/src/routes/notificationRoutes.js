import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddlewares.js";

import {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controller/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getMyNotifications);
router.put("/", verifyToken, markNotificationAsRead);
router.delete("/", verifyToken, deleteNotification);

export default router;
