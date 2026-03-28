/**
 * Seed default service categories into MongoDB.
 * Safe to run multiple times: skips categories whose name already exists.
 *
 * Usage (from backend/):
 *   npm run seed:categories
 *
 * Requires MONGO_URI in .env (same as the API server).
 */

import dotenv from "dotenv";

dotenv.config();

import mongoose from "mongoose";
import { Category } from "../models/Category";
import { getMongoConnectOptions } from "../config/mongoClientOptions";

const CONNECT_ATTEMPTS = 5;
const CONNECT_BACKOFF_MS = 2500;

async function connectWithRetry(uri: string): Promise<void> {
    const opts = getMongoConnectOptions();
    let last: unknown;
    for (let i = 0; i < CONNECT_ATTEMPTS; i++) {
        try {
            if (mongoose.connection.readyState === 1) {
                return;
            }
            await mongoose.connect(uri, opts);
            return;
        } catch (err) {
            last = err;
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect().catch(() => undefined);
            }
            const wait = CONNECT_BACKOFF_MS * (i + 1);
            console.warn(
                `MongoDB connect failed (attempt ${i + 1}/${CONNECT_ATTEMPTS}). Retrying in ${wait}ms…`,
                err instanceof Error ? err.message : err,
            );
            await new Promise((r) => setTimeout(r, wait));
        }
    }
    throw last;
}

/**
 * Categories to seed (skips any name already in MongoDB).
 * Replaces older seed entries like Plumbing/Electrical when you want only new verticals — add more rows anytime.
 */
const CATEGORIES_TO_SEED: { name: string; description: string }[] = [
    {
        name: "HVAC & Air Conditioning",
        description:
            "Heating, cooling, AC tune-ups, duct issues, and seasonal climate comfort for your home.",
    },
    {
        name: "Handyman Services",
        description:
            "Small repairs, furniture assembly, mounting, caulking, and general fix-it tasks around the house.",
    },
    {
        name: "Landscaping & Lawn Care",
        description:
            "Lawn mowing, edging, planting, garden upkeep, and outdoor seasonal maintenance.",
    },
    {
        name: "Pet Care & Dog Walking",
        description:
            "Dog walking, drop-in pet visits, feeding, and local pet-sitting while you are away.",
    },
    {
        name: "Moving & Hauling Help",
        description:
            "Loading and unloading trucks, local move assistance, and heavy lifting with a helping crew.",
    },
];

async function main(): Promise<void> {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("Missing MONGO_URI. Set it in backend/.env and try again.");
        process.exit(1);
    }

    await connectWithRetry(mongoUri);

    let created = 0;
    let skipped = 0;

    for (const row of CATEGORIES_TO_SEED) {
        const existing = await Category.findOne({ name: row.name });
        if (existing) {
            console.log(`Skip (exists): ${row.name}`);
            skipped += 1;
            continue;
        }
        await Category.create(row);
        console.log(`Created: ${row.name}`);
        created += 1;
    }

    console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
