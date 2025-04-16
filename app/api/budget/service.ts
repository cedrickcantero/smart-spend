import { api } from "@/lib/services/api-service";
import { DBBudget } from "@/types/supabase";

// Budget category icons mapping
const categoryIcons: Record<string, string> = {
  "food": "🍔",
  "housing": "🏠",
  "transportation": "🚗",
  "entertainment": "🎬",
  "shopping": "🛍️",
  "utilities": "💡",
  "health": "💊",
  "travel": "✈️",
  "education": "📚",
  "personal": "👤",
  "other": "📦"
};

// Budget with category name and other display properties
export interface BudgetWithCategory extends DBBudget {
  categoryName: string;
  percentageUsed: number;
}

export const BudgetService = {
  getBudgets: async (): Promise<BudgetWithCategory[]> => {
    try {
      const budgets = await api.get<DBBudget[]>("/api/budget");
      const categories = await api.get<Record<string, {name: string, icon: string}>>("/api/categories");
      
      // Map budgets with category names and calculate percentage
      return budgets.map(budget => {
        const category = categories[budget.category_id || ''] || { name: 'Uncategorized', icon: '📦' };
        const percentageUsed = budget.amount > 0 ? (budget.spent || 0 / budget.amount) * 100 : 0;
        
        return {
          ...budget,
          categoryName: category.name,
          percentageUsed,
          // Use icon from budget if available, otherwise from category, or default
          icon: budget.icon || category.icon || categoryIcons.other
        };
      });
    } catch (error) {
      console.error("Error fetching budgets:", error);
      throw error;
    }
  },

  getBudgetByCategory: async (categoryId: string): Promise<DBBudget> => {
    try {
      return await api.get<DBBudget>(`/api/budget/category/${categoryId}`);
    } catch (error) {
      console.error("Error fetching budget for category:", error);
      throw error;
    }
  },

  createBudget: async (budget: Omit<DBBudget, 'user_id' | 'created_at' | 'updated_at' | 'id' | 'spent' | 'remaining' | 'status'> & { budget_name?: string }): Promise<DBBudget> => {
    try {
      // Add icon if category is known
      const budgetWithIcon = {
        ...budget,
        icon: budget.icon || (budget.category_id ? categoryIcons[budget.category_id] : null)
      };
      
      return await api.post<DBBudget>("/api/budget", budgetWithIcon);
    } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
    }
  },

  updateBudget: async (budget: Partial<DBBudget> & { id: string }): Promise<DBBudget> => {
    try {
      return await api.put<DBBudget>(`/api/budget/${budget.id}`, budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  },

  deleteBudget: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/budget/${id}`);
    } catch (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
  },

  getBudgetSummary: async (): Promise<{
    totalAllocated: number;
    totalSpent: number;
    totalRemaining: number;
    percentUsed: number;
    dailyTarget: number;
  }> => {
    try {
      const budgets = await BudgetService.getBudgets();
      
      const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);
      const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
      const totalRemaining = totalAllocated - totalSpent;
      const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
      
      // Calculate daily target for remaining days in the month
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1); // At least 1 day
      const dailyTarget = totalRemaining / remainingDays;
      
      return {
        totalAllocated,
        totalSpent,
        totalRemaining,
        percentUsed,
        dailyTarget
      };
    } catch (error) {
      console.error("Error calculating budget summary:", error);
      return {
        totalAllocated: 0,
        totalSpent: 0,
        totalRemaining: 0,
        percentUsed: 0,
        dailyTarget: 0
      };
    }
  }
}