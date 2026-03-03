import { SkipList, RankedProvider } from "./SkipList";
import { ProviderProfile } from "../models/ProviderProfile";
import { computeScore } from "../utils/scoreCalculator";

export interface RankingResult {
  id: string;
  score: number;
}

class RankingEngine {
  private lists: Map<string, SkipList> = new Map();

  async bootstrap(): Promise<void> {
    try {
      // Load all available providers from MongoDB
      // Fix: Query already safely skips unavailable providers (isAvailable: true)
      const providers = await ProviderProfile.find({ isAvailable: true })
        .select("_id categoryId rating price location")
        .lean();

      for (const provider of providers) {
        // Fix: Missing null checks for database edge cases
        if (!provider.categoryId || !provider._id) continue;

        const categoryId = provider.categoryId.toString();

        if (!this.lists.has(categoryId)) {
          this.lists.set(categoryId, new SkipList());
        }

        // Calculate score (distance = 0 for bootstrap, no lat/lng provided)
        // Fix: Fallbacks for ranking attributes to prevent NaN score values
        const score = computeScore(
          provider.rating || 0,
          provider.price || 0,
          0
        );

        this.lists.get(categoryId)!.insert(provider._id.toString(), score);
      }

      console.log(
        `✓ Ranking engine bootstrapped with ${this.lists.size} categories`
      );
    } catch (error) {
      console.error("Ranking engine bootstrap error:", error);
    }
  }

  upsert(
    categoryId: string,
    providerId: string,
    rating: number,
    price: number,
    distance: number = 0
  ): void {
    // Fix: Basic null checks for stability
    if (!categoryId || !providerId) return;

    if (!this.lists.has(categoryId)) {
      this.lists.set(categoryId, new SkipList());
    }

    const score = computeScore(rating || 0, price || 0, distance || 0);
    this.lists.get(categoryId)!.insert(providerId, score);

    // Testing log requested to verify Skip List updates:
    console.log(`Updated provider ${providerId} with new score ${score}`);
  }

  remove(
    categoryId: string,
    providerId: string
  ): void {
    if (!this.lists.has(categoryId)) {
      return;
    }

    this.lists.get(categoryId)!.remove(providerId);
  }

  getTopK(categoryId: string, k: number = 10): RankedProvider[] {
    if (!this.lists.has(categoryId)) {
      return [];
    }

    return this.lists.get(categoryId)!.getTopK(k);
  }
}

// Export singleton instance
export const rankingEngine = new RankingEngine();
