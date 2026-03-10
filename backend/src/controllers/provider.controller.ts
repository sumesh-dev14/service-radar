import { Response } from "express";
import { Types } from "mongoose";
import { ProviderProfile, IProviderProfile } from "../models/ProviderProfile";
import { User } from "../models/User";
import { rankingEngine } from "../engine/RankingEngine";
import {
  computeScore,
  haversineDistance,
} from "../utils/scoreCalculator";
import { AuthRequest } from "../types";
import { sendSuccess, sendError } from "../utils/responseHandler";

export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const profile = await ProviderProfile.findOne({ userId: req.user._id }).populate('categoryId');
    if (!profile) {
      sendError(res, 404, "Profile not found");
      return;
    }

    sendSuccess(res, 200, "Profile retrieved successfully", { profile });
  } catch (error) {
    console.error("Get my profile error:", error);
    sendError(res, 500, "Failed to retrieve profile");
  }
};

export const createProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { categoryId, bio, price, location } = req.body;

    // Validate required fields
    if (!categoryId || !bio || !price || !location) {
      sendError(res, 400, "Missing required fields");
      return;
    }

    // Validate location object has lat and lng
    if (typeof location !== "object" || !location.lat || !location.lng) {
      sendError(res, 400, "Location must have lat and lng properties");
      return;
    }

    // Validate lat and lng are numbers within valid ranges
    if (
      typeof location.lat !== "number" || typeof location.lng !== "number" ||
      location.lat < -90 || location.lat > 90 ||
      location.lng < -180 || location.lng > 180
    ) {
      sendError(res, 400, "Invalid latitude or longitude values");
      return;
    }

    // Check if profile already exists
    const existingProfile = await ProviderProfile.findOne({
      userId: req.user._id,
    });
    if (existingProfile) {
      sendError(res, 409, "Profile already exists");
      return;
    }

    // Create profile
    const profile = await ProviderProfile.create({
      userId: req.user._id,
      categoryId: new Types.ObjectId(categoryId),
      bio,
      price,
      location,
      rating: 0,
      totalReviews: 0,
      isAvailable: true,
    });

    // Populate categoryId before returning
    await profile.populate('categoryId');

    // Add to ranking engine
    rankingEngine.upsert(categoryId, profile._id.toString(), 0, price, 0);

    sendSuccess(res, 201, "Profile created successfully", { profile });
  } catch (error) {
    console.error("Create profile error:", error);
    sendError(res, 500, "Failed to create profile");
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const { bio, price, location } = req.body;

    // Find profile
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      sendError(res, 404, "Profile not found");
      return;
    }

    // Update fields
    if (bio !== undefined) profile.bio = bio;
    if (price !== undefined) profile.price = price;
    if (location !== undefined) profile.location = location;

    await profile.save();

    // Populate categoryId before returning
    await profile.populate('categoryId');

    // Recalculate score in ranking engine
    const categoryId = profile.categoryId.toString();
    const newScore = computeScore(profile.rating, profile.price, 0);
    rankingEngine.upsert(
      categoryId,
      profile._id.toString(),
      profile.rating,
      profile.price,
      0
    );

    sendSuccess(res, 200, "Profile updated successfully", { profile });
  } catch (error) {
    console.error("Update profile error:", error);
    sendError(res, 500, "Failed to update profile");
  }
};

export const toggleAvailability = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    // Find profile
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      sendError(res, 404, "Profile not found");
      return;
    }

    const categoryId = profile.categoryId.toString();
    const providerId = profile._id.toString();

    // Toggle availability
    profile.isAvailable = !profile.isAvailable;
    await profile.save();

    // Update ranking engine
    if (profile.isAvailable) {
      rankingEngine.upsert(
        categoryId,
        providerId,
        profile.rating,
        profile.price,
        0
      );
    } else {
      rankingEngine.remove(categoryId, providerId);
    }

    sendSuccess(res, 200, `Provider ${profile.isAvailable ? "is now" : "is no longer"} available`, {
      isAvailable: profile.isAvailable,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);
    sendError(res, 500, "Failed to toggle availability");
  }
};

export const getProviders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      category: categoryId,
      lat,
      lng,
      limit = "10",
    } = req.query;

    if (!categoryId) {
      sendError(res, 400, "Category query parameter is required");
      return;
    }

    const k = Math.min(parseInt(limit as string), 100);
    const userLat = lat ? parseFloat(lat as string) : undefined;
    const userLng = lng ? parseFloat(lng as string) : undefined;

    // Get top K from ranking engine
    let topProviderIds = rankingEngine.getTopK(categoryId as string, k);

    // If location provided, recalculate scores with distance
    if (userLat !== undefined && userLng !== undefined) {
      const profileIds = topProviderIds.map((p) => new Types.ObjectId(p.id));
      const profiles = await ProviderProfile.find({
        _id: { $in: profileIds },
        isAvailable: true,
      });

      // Recalculate scores with distance
      const scoredProfiles = profiles.map((p) => {
        const distance = haversineDistance(
          userLat,
          userLng,
          p.location.lat,
          p.location.lng
        );
        const score = computeScore(p.rating, p.price, distance);
        return { id: p._id.toString(), score };
      });

      // Sort by score descending
      topProviderIds = scoredProfiles.sort((a, b) => b.score - a.score);
    }

    // Fetch full profiles from MongoDB
    const providers = await ProviderProfile.find({
      _id: { $in: topProviderIds.map((p) => new Types.ObjectId(p.id)) },
      isAvailable: true,
    })
      .populate("userId", "name email")
      .populate("categoryId", "name")
      .lean();

    // Maintain ranking order
    const providersMap = new Map(
      providers.map((p) => [p._id.toString(), p])
    );
    const rankedProviders = topProviderIds
      .map((p) => providersMap.get(p.id))
      .filter((p) => p !== undefined);

    sendSuccess(res, 200, "Providers fetched successfully", {
      count: rankedProviders.length,
      providers: rankedProviders,
    });
  } catch (error) {
    console.error("Get providers error:", error);
    sendError(res, 500, "Failed to fetch providers");
  }
};

export const getProviderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const provider = await ProviderProfile.findById(id)
      .populate("userId", "name email")
      .populate("categoryId", "name");

    if (!provider) {
      sendError(res, 404, "Provider not found");
      return;
    }

    sendSuccess(res, 200, "Provider fetched successfully", { provider });
  } catch (error) {
    console.error("Get provider error:", error);
    sendError(res, 500, "Failed to fetch provider");
  }
};
