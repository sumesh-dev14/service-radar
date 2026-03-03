import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  providerId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Post save hook to update provider rating
reviewSchema.post<IReview>("save", async function () {
  try {
    const Review = model<IReview>("Review");

    // Aggregate to calculate average rating and count of reviews
    const stats = await Review.aggregate([
      {
        $match: { providerId: this.providerId },
      },
      {
        $group: {
          _id: "$providerId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const { averageRating, totalReviews } = stats[0];

      // Update ProviderProfile with new rating and totalReviews
      const ProviderProfile = model("ProviderProfile");
      await ProviderProfile.findByIdAndUpdate(
        this.providerId,
        {
          rating: averageRating,
          totalReviews: totalReviews,
        },
        { new: true }
      );
    }
  } catch (error) {
    console.error("Error updating provider rating in post-save hook:", error);
    // Don't throw - review was already saved, just log the error
  }
});

export const Review = model<IReview>("Review", reviewSchema);
