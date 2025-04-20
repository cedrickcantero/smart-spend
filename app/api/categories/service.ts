import { api } from "@/lib/services/api-service"
import {DBCategory, DBCategoryInsert } from "@/types/supabase"

// Simple in-memory cache
interface Cache<T> {
  data: T | null;
  timestamp: number;
  expiry: number;
}

// Cache configuration
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds
let categoriesCache: Cache<DBCategory[]> = {
  data: null,
  timestamp: 0,
  expiry: CACHE_TTL
};

export const CategoriesService = {
  getCategories: async (): Promise<DBCategory[]> => {
    try {
      const now = Date.now();
      
      // Check if cache is valid
      if (
        categoriesCache.data && 
        categoriesCache.timestamp + categoriesCache.expiry > now
      ) {
        return categoriesCache.data;
      }
      
      // Cache miss or expired, fetch fresh data
      const categories = await api.get<DBCategory[]>("/api/categories");
      
      // Update cache
      categoriesCache = {
        data: categories,
        timestamp: now,
        expiry: CACHE_TTL
      };
      
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // If cache exists but is expired, still return it on error
      if (categoriesCache.data) {
        return categoriesCache.data;
      }
      
      throw error;
    }
  },

  createCategory: async (category: DBCategoryInsert): Promise<DBCategory> => {
    try {
      const newCategory = await api.post<DBCategory>("/api/categories", category);
      
      // Invalidate cache after mutation
      categoriesCache.data = null;
      
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (category: DBCategory): Promise<DBCategory> => {
    try {
      const updatedCategory = await api.put<DBCategory>(`/api/categories/${category.id}`, category);
      
      // Update cache if it exists
      if (categoriesCache.data) {
        categoriesCache.data = categoriesCache.data.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        );
      }
      
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;  
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/categories/${id}`);
      
      // Update cache if it exists
      if (categoriesCache.data) {
        categoriesCache.data = categoriesCache.data.filter(cat => cat.id !== id);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
  
  // Manually invalidate the cache
  invalidateCache: (): void => {
    categoriesCache.data = null;
  }
}