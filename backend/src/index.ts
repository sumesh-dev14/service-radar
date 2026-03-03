import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import mongoose from "mongoose";
import authRouter from "./routes/auth.routes";
import providerRouter from "./routes/provider.routes";
import bookingRouter from "./routes/booking.routes";
import reviewRouter from "./routes/review.routes";
import { rankingEngine } from "./engine/RankingEngine";
import categoryRouter from "./routes/category.routes";
import { sendSuccess } from "./utils/responseHandler";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"]; // Vite default port

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/api/health", (req: Request, res: Response) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  sendSuccess(res, 200, "Server is healthy", {
    status: "ok",
    db: dbStatus,
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/providers", providerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/categories", categoryRouter);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Bootstrap ranking engine
    await rankingEngine.bootstrap();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
