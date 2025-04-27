import { SupabaseClient } from '@supabase/supabase-js';
import { DBExpense } from '@/types/supabase';

export interface DashboardData {
  totalExpenses: {
    amount: number;
    percentChange: number;
  };
  monthlyBudget: {
    amount: number;
    used: number;
    percentage: number;
  };
  savingsGoal: {
    target: number;
    current: number;
    percentage: number;
    name: string;
  };
  taxDeductions: {
    amount: number;
  };
}

export const DashboardService = {
  async getExpenses(userId: string, supabase: SupabaseClient): Promise<DBExpense[] | { error: string }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching expenses:', error);
      return { error: error.message };
    }

    return data || [];
  },
  
  async getDashboardData(userId: string, supabase: SupabaseClient): Promise<DashboardData | { error: string }> {
    try {
      const [
        totalExpenses, 
        monthlyBudget, 
        savingsGoal, 
        taxDeductions
      ] = await Promise.all([
        DashboardService.getTotalExpenses(userId, supabase),
        DashboardService.getMonthlyBudget(userId, supabase),
        DashboardService.getSavingsGoal(userId, supabase),
        DashboardService.getTaxDeductions(userId, supabase)
      ]);

      return {
        totalExpenses,
        monthlyBudget,
        savingsGoal,
        taxDeductions
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return { error: (error as Error).message };
    }
  },

  async getTotalExpenses(userId: string, supabase: SupabaseClient): Promise<{ amount: number; percentChange: number }> {
    try {
      const currentDate = new Date();
      
      // Current month range
      const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Previous month range
      const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      const firstDayCurrentStr = firstDayCurrentMonth.toISOString().split('T')[0];
      const lastDayCurrentStr = lastDayCurrentMonth.toISOString().split('T')[0];
      const firstDayPreviousStr = firstDayPreviousMonth.toISOString().split('T')[0];
      const lastDayPreviousStr = lastDayPreviousMonth.toISOString().split('T')[0];
      
      // Get expenses for current month
      const { data: currentMonthData, error: currentMonthError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', firstDayCurrentStr)
        .lte('date', lastDayCurrentStr);
      
      if (currentMonthError) throw currentMonthError;
      
      // Get expenses for previous month
      const { data: previousMonthData, error: previousMonthError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', firstDayPreviousStr)
        .lte('date', lastDayPreviousStr);
      
      if (previousMonthError) throw previousMonthError;
      
      // Calculate totals
      const currentMonthTotal = currentMonthData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const previousMonthTotal = previousMonthData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      
      // Calculate percentage change
      let percentChange = 0;
      if (previousMonthTotal > 0) {
        percentChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
      }
      
      return {
        amount: currentMonthTotal,
        percentChange: parseFloat(percentChange.toFixed(1)) // Round to 1 decimal place
      };
    } catch (error) {
      console.error("Error fetching total expenses:", error);
      return { amount: 0, percentChange: 0 };
    }
  },

  async getMonthlyBudget(userId: string, supabase: SupabaseClient): Promise<{ amount: number; used: number; percentage: number }> {
    try {
      // Fetch monthly budget
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('period', 'monthly')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;
      
      const budgetAmount = budgetData?.amount || 0; // Default budget if none set
      
      // Get total expenses for this month to calculate usage
      const totalExpenses = await DashboardService.getTotalExpenses(userId, supabase);
      
      const usedPercentage = Math.min(100, (totalExpenses.amount / budgetAmount) * 100);
      
      return {
        amount: budgetAmount,
        used: totalExpenses.amount,
        percentage: parseFloat(usedPercentage.toFixed(1))
      };
    } catch (error) {
      console.error("Error fetching monthly budget:", error);
      return { amount: 0, used: 0, percentage: 0 };
    }
  },

  async getSavingsGoal(userId: string, supabase: SupabaseClient): Promise<{ target: number; current: number; percentage: number; name: string }> {
    try {
      // Fetch the top savings goal
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        return {
          target: 0,
          current: 0,
          percentage: 0,
          name: "Default Goal"
        };
      }
      
      const percentage = (data.current_amount / data.target_amount) * 100;
      
      return {
        target: data.target_amount,
        current: data.current_amount,
        percentage: parseFloat(percentage.toFixed(1)),
        name: data.name
      };
    } catch (error) {
      console.error("Error fetching savings goal:", error);
      return { target: 0, current: 0, percentage: 0, name: "Default Goal" };
    }
  },

  async getTaxDeductions(userId: string, supabase: SupabaseClient): Promise<{ amount: number }> {
    try {
      // Fetch tax deductible expenses for the current year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .eq('is_tax_deductible', true)
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      
      return { amount: total };
    } catch (error) {
      console.error("Error fetching tax deductions:", error);
      return { amount: 0 };
    }
  },

  async getExpensesByCategory(userId: string, supabase: SupabaseClient): Promise<{ category: string; amount: number; color: string }[]> {
    try {
      // Get the current month's range
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const firstDayStr = firstDay.toISOString().split('T')[0];
      const lastDayStr = lastDay.toISOString().split('T')[0];
      
      // First get all expenses for the month
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, category_id')
        .eq('user_id', userId)
        .gte('date', firstDayStr)
        .lte('date', lastDayStr);
      
      if (expensesError) throw expensesError;
      
      // Then get all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, color');
        
      if (categoriesError) throw categoriesError;
      
      // Create a map of category IDs to their data
      const categoryMap = new Map<string, { name: string; color: string }>();
      categories.forEach(cat => {
        categoryMap.set(cat.id, { name: cat.name, color: cat.color || '#888888' });
      });
      
      // Group expenses by category and sum amounts
      const expensesByCategory = new Map<string, { amount: number; color: string }>();
      
      expenses.forEach(expense => {
        const categoryId = expense.category_id;
        const amount = expense.amount || 0;
        
        if (!categoryId) {
          // Handle uncategorized expenses
          const uncategorizedKey = 'Uncategorized';
          const currentAmount = expensesByCategory.get(uncategorizedKey)?.amount || 0;
          expensesByCategory.set(uncategorizedKey, { 
            amount: currentAmount + amount, 
            color: '#888888' 
          });
          return;
        }
        
        const category = categoryMap.get(categoryId);
        if (!category) return;
        
        const categoryName = category.name;
        if (expensesByCategory.has(categoryName)) {
          const currentAmount = expensesByCategory.get(categoryName)!.amount;
          expensesByCategory.set(categoryName, {
            amount: currentAmount + amount,
            color: category.color
          });
        } else {
          expensesByCategory.set(categoryName, {
            amount: amount,
            color: category.color
          });
        }
      });
      
      // Convert map to array for easier consumption
      return Array.from(expensesByCategory.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        color: data.color
      }));
    } catch (error) {
      console.error("Error fetching expenses by category:", error);
      return [];
    }
  }
};
