import { Response } from "express";
import { Types } from "mongoose";
import { Booking, IBooking } from "../models/Booking";
import { ProviderProfile } from "../models/ProviderProfile";
import { AuthRequest } from "../types";
import { sendSuccess, sendError } from "../utils/responseHandler";


/* Utility */


const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};


/* Create Booking */


export const createBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { providerId, categoryId, scheduledAt, scheduledDate } = req.body;
    const scheduled = scheduledAt || scheduledDate;

    if (!providerId || !scheduled) {
      sendError(res, 400, "Missing required fields");
      return;
    }

    if (
      !isValidObjectId(providerId) ||
      (categoryId && !isValidObjectId(categoryId))
    ) {
      sendError(res, 400, "Invalid provider or category ID");
      return;
    }

    const provider = await ProviderProfile.findById(providerId);

    if (!provider) {
      sendError(res, 404, "Provider not found");
      return;
    }

    if (!provider.isAvailable) {
      sendError(res, 400, "Provider is not available");
      return;
    }

    const scheduledDateObj = new Date(scheduled);
    const now = new Date();

    if (isNaN(scheduledDateObj.getTime()) || scheduledDateObj <= now) {
      sendError(res, 400, "Scheduled date must be in the future");
      return;
    }

    // Prevent double booking - check for any overlapping bookings
    // Assuming bookings have 1-hour duration (adjust as needed)
    const oneHourLater = new Date(scheduledDateObj.getTime() + 60 * 60 * 1000);
    const existingBooking = await Booking.findOne({
      providerId: provider._id,
      $or: [
        // Scheduled date is during an existing booking
        {
          scheduledDate: { $lte: scheduledDateObj },
          $expr: {
            $gt: [
              { $add: ["$scheduledDate", 60 * 60 * 1000] }, // Add 1 hour to existing booking
              scheduledDateObj
            ]
          }
        },
        // Existing booking is during the new scheduled time
        {
          scheduledDate: { $gte: scheduledDateObj, $lt: oneHourLater }
        }
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (existingBooking) {
      sendError(res, 400, "Provider already has a booking at this time");
      return;
    }

    const bookingPayload: Partial<IBooking> = {
      customerId: req.user._id,
      providerId: new Types.ObjectId(providerId),
      scheduledDate: scheduledDateObj,
      status: "pending",
    };

    if (categoryId) {
      bookingPayload.categoryId = new Types.ObjectId(categoryId);
    }

    const booking = await Booking.create(bookingPayload);

    sendSuccess(res, 201, "Booking created successfully", booking);
  } catch (error) {
    console.error("Create booking error:", error);
    sendError(res, 500, "Failed to create booking");
  }
};


/* Get My Bookings */


export const getMyBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const providerProfile = await ProviderProfile.findOne({
      userId: req.user._id,
    });

    const conditions: any[] = [{ customerId: req.user._id }];

    if (providerProfile) {
      conditions.push({ providerId: providerProfile._id });
    }

    const bookings = await Booking.find({
      $or: conditions,
    })
      .populate("customerId", "name email")
      .populate({
        path: "providerId",
        select: "price bio",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, "Bookings fetched successfully", {
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    sendError(res, 500, "Failed to fetch bookings");
  }
};


/* Get Booking By ID */


export const getBookingById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    const booking = await Booking.findById(id)
      .populate("customerId", "name email")
      .populate({
        path: "providerId",
        select: "price bio",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name");

    if (!booking) {
      sendError(res, 404, "Booking not found");
      return;
    }

    const userId = req.user._id.toString();
    const customerId = booking.customerId instanceof Types.ObjectId
      ? booking.customerId.toString()
      : (booking.customerId as any)._id.toString();

    const providerProfile = await ProviderProfile.findOne({
      userId: req.user._id,
    });

    const providerId = providerProfile?._id.toString();

    if (customerId !== userId && providerId !== booking.providerId.toString()) {
      sendError(
        res,
        403,
        "Forbidden: You are not a participant in this booking"
      );
      return;
    }

    sendSuccess(res, 200, "Booking fetched successfully", { booking });
  } catch (error) {
    console.error("Get booking error:", error);
    sendError(res, 500, "Failed to fetch booking");
  }
};


/* Accept Booking */


export const acceptBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    const booking = await Booking.findById(id).populate({
      path: "providerId",
      populate: { path: "userId", select: "_id" }
    });

    if (!booking) {
      sendError(res, 404, "Booking not found");
      return;
    }

    // Safely get provider user ID with null checks
    const providerProfile = booking.providerId as any;
    if (!providerProfile || !providerProfile.userId) {
      sendError(res, 400, "Invalid booking data: provider profile missing");
      return;
    }
    const providerUserId = providerProfile.userId._id?.toString() || providerProfile.userId.toString();

    if (providerUserId !== req.user._id.toString()) {
      sendError(res, 403, "Forbidden: You are not the assigned provider");
      return;
    }

    if (booking.status !== "pending") {
      sendError(
        res,
        400,
        `Cannot accept booking with status: ${booking.status}`
      );
      return;
    }

    booking.status = "accepted";
    await booking.save();

    sendSuccess(res, 200, "Booking accepted successfully", booking);
  } catch (error) {
    console.error("Accept booking error:", error);
    sendError(res, 500, "Failed to accept booking");
  }
};


/* Cancel Booking */


export const cancelBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      sendError(res, 404, "Booking not found");
      return;
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      sendError(res, 403, "Forbidden: Only customer can cancel");
      return;
    }

    if (booking.status !== "pending") {
      sendError(
        res,
        400,
        `Cannot cancel booking with status: ${booking.status}`
      );
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    sendSuccess(res, 200, "Booking cancelled successfully", booking);
  } catch (error) {
    console.error("Cancel booking error:", error);
    sendError(res, 500, "Failed to cancel booking");
  }
};


/* Complete Booking */


export const completeBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    const booking = await Booking.findById(id).populate({
      path: "providerId",
      populate: { path: "userId", select: "_id" }
    });

    if (!booking) {
      sendError(res, 404, "Booking not found");
      return;
    }

    // Safely get provider user ID with null checks
    const providerProfile = booking.providerId as any;
    if (!providerProfile || !providerProfile.userId) {
      sendError(res, 400, "Invalid booking data: provider profile missing");
      return;
    }
    const providerUserId = providerProfile.userId._id?.toString() || providerProfile.userId.toString();

    if (providerUserId !== req.user._id.toString()) {
      sendError(res, 403, "Forbidden: You are not the assigned provider");
      return;
    }

    if (booking.status !== "accepted") {
      sendError(
        res,
        400,
        `Cannot complete booking with status: ${booking.status}`
      );
      return;
    }

    booking.status = "completed";
    await booking.save();

    sendSuccess(res, 200, "Booking completed successfully", booking);
  } catch (error) {
    console.error("Complete booking error:", error);
    sendError(res, 500, "Failed to complete booking");
  }
};


/* Update Booking Status (Generic) */


export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      sendError(res, 400, "Invalid booking ID");
      return;
    }

    if (!status || !["pending", "accepted", "cancelled", "completed"].includes(status)) {
      sendError(res, 400, "Invalid status");
      return;
    }

    const booking = await Booking.findById(id).populate({
      path: "providerId",
      populate: { path: "userId", select: "_id" }
    });

    if (!booking) {
      sendError(res, 404, "Booking not found");
      return;
    }

    // Check authorization: provider can accept/complete/cancel, customer can only cancel
    const providerProfile = booking.providerId as any;
    const isProvider = providerProfile?.userId?._id?.toString() === req.user._id.toString();
    const isCustomer = booking.customerId.toString() === req.user._id.toString();

    if (!isProvider && !isCustomer) {
      sendError(res, 403, "Forbidden: You are not a participant in this booking");
      return;
    }

    // Validate status transitions
    const currentStatus = booking.status;

    if (status === "accepted") {
      if (!isProvider) {
        sendError(res, 403, "Only provider can accept booking");
        return;
      }
      if (currentStatus !== "pending") {
        sendError(res, 400, `Cannot accept booking with status: ${currentStatus}`);
        return;
      }
    } else if (status === "completed") {
      if (!isProvider) {
        sendError(res, 403, "Only provider can complete booking");
        return;
      }
      if (currentStatus !== "accepted") {
        sendError(res, 400, `Cannot complete booking with status: ${currentStatus}`);
        return;
      }
    } else if (status === "cancelled") {
      if (currentStatus !== "pending" && currentStatus !== "accepted") {
        sendError(res, 400, `Cannot cancel booking with status: ${currentStatus}`);
        return;
      }
    }

    booking.status = status;
    await booking.save();

    sendSuccess(res, 200, `Booking ${status} successfully`, { booking });
  } catch (error) {
    console.error("Update booking status error:", error);
    sendError(res, 500, "Failed to update booking status");
  }
};