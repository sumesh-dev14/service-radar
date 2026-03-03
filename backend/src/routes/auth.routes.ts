import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

/**
 * POST /register
 * Register a new user
 */
authRouter.post("/register", register);

/**
 * POST /login
 * Login user
 */
authRouter.post("/login", login);

/**
 * POST /logout
 * Logout user
 * Requires: Authorization Bearer token
 */
authRouter.post("/logout", authMiddleware, logout);

/**
 * GET /me
 * Get current logged-in user
 * Requires: Authorization Bearer token
 */
authRouter.get("/me", authMiddleware, me);

export default authRouter;
