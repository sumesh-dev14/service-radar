import { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  customerId: Types.ObjectId;
  providerId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  status: "pending" | "accepted" | "completed" | "cancelled";
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });

export const Booking = model<IBooking>("Booking", bookingSchema);
