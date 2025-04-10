import { api } from "@/lib/services/api-service";
import { DBRecurringBill } from "@/types/supabase";


export const RecurringService = {
    getRecurringExpenses: async (): Promise<DBRecurringBill[]> => {
        try {
          return await api.get<DBRecurringBill[]>("/api/recurring");
        } catch (error) {
          console.error("Error fetching recurring expenses:", error);
          throw error;
        }
      },
      createRecurringExpense: async (expense: DBRecurringBill): Promise<DBRecurringBill> => {
        try {
          return await api.post<DBRecurringBill>("/api/recurring", expense);
        } catch (error) {
          console.error("Error creating recurring expense:", error);
          throw error;
        }
      },
      updateRecurringExpense: async (expense: DBRecurringBill): Promise<DBRecurringBill> => {
        try {
          return await api.put<DBRecurringBill>(`/api/recurring/${expense.id}`, expense);
        } catch (error) {
          console.error("Error updating recurring expense:", error);
          throw error;
        }
      },
      deleteRecurringExpense: async (id: string): Promise<void> => {
        try {
          await api.delete(`/api/recurring/${id}`);
        } catch (error) {
          console.error("Error deleting recurring expense:", error);
          throw error;
        }
      }
}
