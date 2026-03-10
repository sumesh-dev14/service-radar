/**
 * Category Service — Service Radar
 * Ref: §Category Endpoints
 *
 * Endpoints:
 *   GET /categories — fetch all service categories (public, no auth)
 */

import api from './api'
import type { ApiResponse, Category, CategoriesResponseData } from '@/types/models'

// ── Get All Categories (public) ───────────────────────────────────────────────

let _categoryCache: Category[] | null = null

/**
 * Fetch all service categories.
 * Uses in-memory cache to avoid redundant network calls
 * (categories rarely change; cache busted on page reload).
 */
export async function getCategories(
    options: { useCache?: boolean } = { useCache: true },
): Promise<Category[]> {
    if (options.useCache && _categoryCache) {
        return _categoryCache
    }

    const { data } = await api.get<ApiResponse<CategoriesResponseData>>(
        '/categories',
    )

    if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Failed to fetch categories')
    }

    _categoryCache = data.data.categories
    return _categoryCache
}

/** Clear the in-memory category cache (e.g. after admin operations) */
export function clearCategoryCache(): void {
    _categoryCache = null
}
