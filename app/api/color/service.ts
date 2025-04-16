import { api } from "@/lib/services/api-service"
import { DBColor } from "@/types/supabase"

export const ColorService = {
  getColors: async (): Promise<DBColor[]> => {
    try {
      return await api.get<DBColor[]>("/api/color");
    } catch (error) {
      console.error("Error fetching colors:", error);
      throw error;
    }
  },

  createColor: async (color: DBColor): Promise<DBColor> => {
    try {
      return await api.post<DBColor>("/api/color", color);
    } catch (error) {
      console.error("Error creating color:", error);
      throw error;
    }
  },

  updateColor: async (color: DBColor): Promise<DBColor> => {
    try {
      if (!color.id) {
        throw new Error('Color ID is required');
      }
      return await api.put<DBColor>(`/api/color/${color.id}`, color);
    } catch (error) {
      console.error(`Error updating color ${color.id}:`, error);
      throw error;
    }
  },

  deleteColor: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/color/${id}`);
    } catch (error) {
      console.error(`Error deleting color ${id}:`, error);
      throw error;
    }
  }
}
