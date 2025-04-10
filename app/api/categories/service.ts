
import { api } from "@/lib/services/api-service"
import { DBCalendarEvent, DBCalendarEventInsert, DBCategory, DBCategoryInsert } from "@/types/supabase"

export const CategoriesService = {
  getCategories: async (): Promise<DBCategory[]> => {
    try {
      return await api.get<DBCategory[]>("/api/categories");
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  createCategory: async (category: DBCategoryInsert): Promise<DBCategory> => {
    try {
      return await api.post<DBCategory>("/api/categories", category);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (category: DBCategory): Promise<DBCategory> => {
    try {
      return await api.put<DBCategory>(`/api/categories/${category.id}`, category);
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;  
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/categories/${id}`);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}