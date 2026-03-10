import { Response } from "express";
import { Types } from "mongoose";
import { Review, IReview } from "../models/Review";
import { Booking } from "../models/Booking";
import { ProviderProfile } from "../models/ProviderProfile";
import { rankingEngine } from "../engine/RankingEngine";
import { AuthRequest } from "../types";
import { sendSuccess, sendError } from "../utils/responseHandler";

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { bookingId, rating, comment } = req.body;

    // Validate required fields
    if (!bookingId || !rating || !comment) {
      sendError(res, 400, "Missing required fields");
      return;
    }

    // Validate ObjectId
    if (!isValidObjectId(bookingId)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    // Validate rating (1-5, must be a number)
    if (rating === undefined || rating === null || typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      sendError(res, 400, "Rating must be a number between 1 and 5");
      return;
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      sendError(res, 404, "Booking not found");
      return;
    }

    // Verify booking is completed
    if (booking.status !== "completed") {
      sendError(res, 400, "Review can only be created for completed bookings");
      return;
    }

    // Verify user is the customer
    if (booking.customerId.toString() !== req.user._id.toString()) {
      sendError(res, 403, "Forbidden: Only the customer can review");
      return;
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      sendError(res, 409, "Review already exists for this booking");
      return;
    }

    // Create review
    const review = await Review.create({
      bookingId: new Types.ObjectId(bookingId),
      customerId: req.user._id,
      providerId: booking.providerId,
      rating,
      comment,
    });

    // Fetch updated provider profile (post-save hook updates it)
    const provider = await ProviderProfile.findById(booking.providerId);

    if (provider) {
      // Update ranking engine with new rating
      rankingEngine.upsert(
        provider.categoryId.toString(),
        provider._id.toString(),
        provider.rating,
        provider.price,
        0
      );
    }

    sendSuccess(res, 201, "Review created successfully", {
      review,
      providerRating: provider?.rating,
      providerTotalReviews: provider?.totalReviews,
    });
  } catch (error) {
    console.error("Create review error:", error);
    sendError(res, 500, "Failed to create review");
  }
};
export const checkReviewExists = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(bookingId)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    // Check if review exists for this booking
    const existingReview = await Review.findOne({ bookingId: new Types.ObjectId(bookingId) });

    sendSuccess(res, 200, "Review status checked", {
      exists: !!existingReview,
      review: existingReview ? {
        _id: existingReview._id,
        rating: existingReview.rating,
        comment: existingReview.comment,
        createdAt: existingReview.createdAt
      } : null
    });
  } catch (error) {
    console.error("Check review exists error:", error);
    sendError(res, 500, "Failed to check review status");
  }
};
export const getProviderReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id: providerId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(providerId)) {
      sendError(res, 400, "Invalid provider ID");
      return;
    }

    // Check if provider exists
    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      sendError(res, 404, "Provider not found");
      return;
    }

    // Fetch reviews for provider, newest first
    const reviews = await Review.find({ providerId: new Types.ObjectId(providerId) })
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, "Provider reviews fetched successfully", {
      count: reviews.length,
      providerRating: provider.rating,
      totalReviews: provider.totalReviews,
      reviews,
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);
    sendError(res, 500, "Failed to fetch reviews");
  }
};
