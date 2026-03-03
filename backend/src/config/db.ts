import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export const connectDB = async (): Promise<void> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const mongoUri = process.env.MONGO_URI;

      if (!mongoUri) {
        throw new Error("MONGO_URI environment variable is not defined");
      }

      await mongoose.connect(mongoUri);
      console.log("✓ MongoDB connected successfully");
      return;
    } catch (error) {
      retries++;
      if (retries < MAX_RETRIES) {
        console.error(
          `✗ MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS}ms...`,
          error instanceof Error ? error.message : error
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("✗ MongoDB connection failed after all retries:", error);
        process.exit(1);
      }
    }
  }
};
