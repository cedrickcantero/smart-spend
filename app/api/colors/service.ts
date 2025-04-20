import { api } from "@/lib/services/api-service"
import { DBColor } from "@/types/supabase"

// Simple in-memory cache
interface Cache<T> {
  data: T | null;
  timestamp: number;
  expiry: number;
}

// Cache configuration
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds
let colorsCache: Cache<DBColor[]> = {
  data: null,
  timestamp: 0,
  expiry: CACHE_TTL
};

export const ColorsService = {
  getColors: async (): Promise<DBColor[]> => {
    try {
      const now = Date.now();
      
      // Check if cache is valid
      if (
        colorsCache.data && 
        colorsCache.timestamp + colorsCache.expiry > now
      ) {
        return colorsCache.data;
      }
      
      // Cache miss or expired, fetch fresh data
      const colors = await api.get<DBColor[]>("/api/colors");
      
      // Update cache
      colorsCache = {
        data: colors,
        timestamp: now,
        expiry: CACHE_TTL
      };
      
      return colors;
    } catch (error) {
      console.error("Error fetching colors:", error);
      
      // If cache exists but is expired, still return it on error
      if (colorsCache.data) {
        return colorsCache.data;
      }
      
      throw error;
    }
  },

  getColorById: async (id: string): Promise<DBColor> => {
    try {
      // First check the cache to avoid network request
      const now = Date.now();
      if (
        colorsCache.data && 
        colorsCache.timestamp + colorsCache.expiry > now
      ) {
        const cachedColor = colorsCache.data.find(color => color.id === id);
        if (cachedColor) {
          return cachedColor;
        }
      }
      
      // Not in cache or cache expired, fetch from API
      return await api.get<DBColor>(`/api/colors/${id}`);
    } catch (error) {
      console.error(`Error fetching color with id ${id}:`, error);
      throw error;
    }
  },
  
  // Manually invalidate the cache
  invalidateCache: (): void => {
    colorsCache.data = null;
  }
} 