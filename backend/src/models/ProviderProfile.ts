import { Schema, model, Document, Types } from "mongoose";

export interface ILocation {
  lat: number;
  lng: number;
}

export interface IProviderProfile extends Document {
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  bio: string;
  price: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  location: ILocation;
  createdAt: Date;
  updatedAt: Date;
}

const providerProfileSchema = new Schema<IProviderProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

// Compound index for categoryId and rating
providerProfileSchema.index({ categoryId: 1, rating: -1 });

export const ProviderProfile = model<IProviderProfile>(
  "ProviderProfile",
  providerProfileSchema
);
