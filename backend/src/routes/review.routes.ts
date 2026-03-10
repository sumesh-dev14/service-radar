import { Router } from "express";
import {
  createReview,
  checkReviewExists,
  getProviderReviews,
} from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const reviewRouter = Router();

/**
 * POST /
 * Create a review for a completed booking
 * Requires: Auth + Customer role
 */
reviewRouter.post(
  "/",
  authMiddleware,
  requireRole("customer"),
  createReview
);

/**
 * GET /check/:bookingId
 * Check if a review exists for a booking
 * Requires: Auth
 */
reviewRouter.get("/check/:bookingId", authMiddleware, checkReviewExists);

/**
 * GET /provider/:id
 * Get all reviews for a provider
 * Requires: Public
 */
reviewRouter.get("/provider/:id", getProviderReviews);

export default reviewRouter;
