import { Router } from "express";
import {
  createProfile,
  updateProfile,
  toggleAvailability,
  getProviders,
  getProviderById,
} from "../controllers/provider.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const providerRouter = Router();

/**
 * POST /profile
 * Create provider profile
 * Requires: Auth + Provider role
 */
providerRouter.post(
  "/profile",
  authMiddleware,
  requireRole("provider"),
  createProfile
);

/**
 * PUT /profile
 * Update provider profile
 * Requires: Auth + Provider role
 */
providerRouter.put(
  "/profile",
  authMiddleware,
  requireRole("provider"),
  updateProfile
);

/**
 * PATCH /availability
 * Toggle provider availability
 * Requires: Auth + Provider role
 */
providerRouter.patch(
  "/availability",
  authMiddleware,
  requireRole("provider"),
  toggleAvailability
);

/**
 * GET /
 * Get providers (with optional filters)
 * Query: ?category=<categoryId>&lat=<latitude>&lng=<longitude>&limit=<limit>
 * Requires: Public
 */
providerRouter.get("/", getProviders);

/**
 * GET /:id
 * Get provider by ID
 * Requires: Public
 */
providerRouter.get("/:id", getProviderById);

export default providerRouter;
