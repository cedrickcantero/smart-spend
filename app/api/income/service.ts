import { api } from "@/lib/services/api-service";
import { DBIncome } from "@/types/supabase";

export const IncomeService = {
  getIncome: async (): Promise<DBIncome[]> => {
    try {
      return await api.get<DBIncome[]>("/api/income");
    } catch (error) {
      console.error("Error fetching income:", error);
      throw error;
    }
  },
  getIncomeForDate: async (date: string): Promise<DBIncome[]> => {
    try {
      return await api.get<DBIncome[]>(`/api/income/date/${date}`);
    } catch (error) {
      console.error("Error fetching income for date:", error);
      throw error;  
    }
  },
  getIncomeByCategory: async (): Promise<DBIncome[]> => {
    try {
      return await api.get<DBIncome[]>(`/api/income/category`);
    } catch (error) {
      console.error("Error fetching income by category:", error);
      throw error;
    }
  },
  createIncome: async (income: Omit<DBIncome, 'user_id' | 'created_at' | 'updated_at' | 'id'>): Promise<DBIncome> => {
    try {
      return await api.post<DBIncome>("/api/income", income);
    } catch (error) {
      console.error("Error creating income:", error);
      throw error;
    }
  },
  updateIncome: async (income: DBIncome): Promise<DBIncome> => {
    try {
      return await api.put<DBIncome>(`/api/income/${income.id}`, income);
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  },
  deleteIncome: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/income/${id}`);
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  }
}; 