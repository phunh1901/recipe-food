import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";

// Ưu tiên IPv4 để tránh lỗi "fetch failed" (undici/timeout) trên một số mạng Windows
dns.setDefaultResultOrder("ipv4first");
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import recipeRoutes from "./src/routes/recipeRoutes.js";
import reactionRoutes from "./src/routes/reactionRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import followRoutes from "./src/routes/followRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reaction", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(process.env.PORT, () =>
  console.log("Server chạy cổng", process.env.PORT)
);
