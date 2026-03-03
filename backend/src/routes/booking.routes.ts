import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  cancelBooking,
  completeBooking,
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const bookingRouter = Router();

/**
 * POST /
 * Create a new booking
 * Requires: Auth + Customer role
 */
bookingRouter.post(
  "/",
  authMiddleware,
  requireRole("customer"),
  createBooking
);

/**
 * GET /me
 * Get all bookings for the logged-in user (as customer or provider)
 * Requires: Auth
 */
bookingRouter.get("/me", authMiddleware, getMyBookings);

/**
 * GET /:id
 * Get a specific booking by ID
 * Requires: Auth + Must be a participant
 */
bookingRouter.get("/:id", authMiddleware, getBookingById);

/**
 * PATCH /:id/accept
 * Accept a booking (provider only)
 * Requires: Auth + Provider role
 */
bookingRouter.patch(
  "/:id/accept",
  authMiddleware,
  requireRole("provider"),
  acceptBooking
);

/**
 * PATCH /:id/cancel
 * Cancel a booking (customer only, only if pending)
 * Requires: Auth + Customer role
 */
bookingRouter.patch(
  "/:id/cancel",
  authMiddleware,
  requireRole("customer"),
  cancelBooking
);

/**
 * PATCH /:id/complete
 * Complete a booking (provider only, only if accepted)
 * Requires: Auth + Provider role
 */
bookingRouter.patch(
  "/:id/complete",
  authMiddleware,
  requireRole("provider"),
  completeBooking
);

export default bookingRouter;
