import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { assertProductionEnv, isProd } from "./config/env";
import authRouter from "./routes/auth.routes";
import providerRouter from "./routes/provider.routes";
import bookingRouter from "./routes/booking.routes";
import reviewRouter from "./routes/review.routes";
import { rankingEngine } from "./engine/RankingEngine";
import categoryRouter from "./routes/category.routes";
import { sendSuccess, sendError } from "./utils/responseHandler";

assertProductionEnv();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable("x-powered-by");

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

// Security + performance
// Pure JSON API — disable CSP (not serving HTML)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Health check (no auth)
app.get("/api/health", (req: Request, res: Response) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  sendSuccess(res, 200, "Server is healthy", {
    status: "ok",
    db: dbStatus,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/providers", providerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/categories", categoryRouter);

// 404 for unknown API routes
app.use("/api", (req: Request, res: Response) => {
  sendError(res, 404, "Resource not found");
});

// Fall-through (e.g. mistaken non-API path)
app.use((req: Request, res: Response) => {
  sendError(res, 404, "Not found");
});

// Global error handler (must be 4-arg for Express)
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("[express]", err);
    const message = isProd ? "Internal server error" : err.message;
    sendError(res, 500, message);
  }
);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await rankingEngine.bootstrap();

    const server = app.listen(PORT, () => {
      console.log(
        `✓ Service Radar API listening on port ${PORT} (${isProd ? "production" : "development"})`
      );
    });

    const shutdown = (signal: string) => {
      console.log(`\n${signal} received, shutting down…`);
      server.close(() => {
        void mongoose.disconnect().finally(() => process.exit(0));
      });
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
