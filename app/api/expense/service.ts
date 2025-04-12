import { api } from "@/lib/services/api-service";
import { DBExpense } from "@/types/supabase";


export const ExpenseService = {
  getExpenses: async (): Promise<DBExpense[]> => {
    try {
      return await api.get<DBExpense[]>("/api/expense");
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },
  getExpensesForDate: async (date: string): Promise<DBExpense[]> => {
    try {
      return await api.get<DBExpense[]>(`/api/expense/date/${date}`);
    } catch (error) {
      console.error("Error fetching expenses for date:", error);
      throw error;  
    }
  },
  getExpenseByCategory: async (): Promise<DBExpense[]> => {
    try {
      return await api.get<DBExpense[]>(`/api/expense/category`);
    } catch (error) {
      console.error("Error fetching expenses by category:", error);
      throw error;
    }
  },
  createExpense: async (expense: Omit<DBExpense, 'user_id' | 'created_at' | 'updated_at' | 'id'>): Promise<DBExpense> => {
    try {
      return await api.post<DBExpense>("/api/expense", expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },
  updateExpense: async (expense: DBExpense): Promise<DBExpense> => {
    try {
      return await api.put<DBExpense>(`/api/expense/${expense.id}`, expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },
  deleteExpense: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/expense/${id}`);
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  }
}
