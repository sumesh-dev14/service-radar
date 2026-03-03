import mongoose from "mongoose";
import dotenv from "dotenv";
import { ProviderProfile } from "./models/ProviderProfile";
import { rankingEngine } from "./engine/RankingEngine";

dotenv.config();

async function testRanking() {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to MongoDB for testing");

        const categoryId = new mongoose.Types.ObjectId();

        // Clear old test data in this category if any
        await ProviderProfile.deleteMany({ categoryId });

        const p1 = await ProviderProfile.create({
            userId: new mongoose.Types.ObjectId(),
            categoryId,
            bio: "Provider A - Test",
            rating: 5,
            price: 100,
            isAvailable: true,
            location: { lat: 0, lng: 0 }
        });

        const p2 = await ProviderProfile.create({
            userId: new mongoose.Types.ObjectId(),
            categoryId,
            bio: "Provider B - Test",
            rating: 4,
            price: 50,
            isAvailable: true,
            location: { lat: 0, lng: 0 }
        });

        const p3 = await ProviderProfile.create({
            userId: new mongoose.Types.ObjectId(),
            categoryId,
            bio: "Provider C - Test",
            rating: 4.5,
            price: 200,
            isAvailable: true,
            location: { lat: 0, lng: 0 }
        });

        console.log("Created 3 mock providers.");

        rankingEngine.upsert(categoryId.toString(), p1._id.toString(), p1.rating, p1.price, 0);
        rankingEngine.upsert(categoryId.toString(), p2._id.toString(), p2.rating, p2.price, 0);
        rankingEngine.upsert(categoryId.toString(), p3._id.toString(), p3.rating, p3.price, 0);

        const port = process.env.PORT || 3000;
        console.log(`\nTesting API: GET /api/providers?category=${categoryId.toString()}`);

        const response = await fetch(`http://localhost:${port}/api/providers?category=${categoryId.toString()}`);
        const data: any = await response.json();

        console.log("\nResults from API:");
        if (data.providers) {
            data.providers.forEach((p: any, i: number) => {
                console.log(`Rank ${i + 1}: Bio: ${p.bio} | Rating: ${p.rating} | Price: ${p.price}`);
            });

            const providerBios = data.providers.map((p: any) => p.bio);
            if (providerBios[0].includes("Provider A") && providerBios[1].includes("Provider B") && providerBios[2].includes("Provider C")) {
                console.log("\n✅ Test Passed: Providers are ordered correctly by best score first!");
            } else {
                console.log("\n❌ Test Failed: Providers are not in the expected order");
                console.log("Order received:", providerBios);
            }
        } else {
            console.log("Failed to get providers field in data:", data);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

testRanking();
