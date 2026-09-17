import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";

// Load environment variables early
dotenv.config();

// Ưu tiên IPv4 để tránh lỗi "fetch failed" (undici/timeout) trên một số mạng Windows
dns.setDefaultResultOrder("ipv4first");

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base health & info routes
app.get("/", (req, res) => {
  res.json({
    name: "Recipe Food API Server",
    status: "online",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reaction", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : err.status || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({
    error: status < 500 ? err.message : "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
