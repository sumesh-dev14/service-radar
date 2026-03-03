import { Router } from "express";
import { getCategories, createCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const categoryRouter = Router();

/**
 * POST /
 * Create a new category
 * Requires: Auth (protected - only authenticated users can create)
 */
categoryRouter.post("/", authMiddleware, createCategory);

/**
 * GET /
 * Get all categories
 * Requires: Public
 */
categoryRouter.get("/", getCategories);

export default categoryRouter;