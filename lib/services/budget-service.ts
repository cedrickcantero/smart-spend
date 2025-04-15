import { SupabaseClient } from '@supabase/supabase-js';
import { DBBudget, DBBudgetInsert, DBBudgetUpdate } from '@/types/supabase';

export const BudgetService = {
  async getBudgets(userId: string, supabase: SupabaseClient): Promise<DBBudget[] | { error: string }> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching budgets:', error);
      return { error: error.message };
    }

    // Fetch categories for each budget
    const categories = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    // Add category names to each budget

    console.log("categories", categories)

    const budgetsWithCategories = data?.map(budget => {
      const category = categories.data?.find(c => c.id === budget.category_id);
      return {
        ...budget,
        category: category
      };
    });
    
    return budgetsWithCategories || [];
  },

  async getBudgetByCategory(categoryId: string, userId: string, supabase: SupabaseClient): Promise<DBBudget | { error: string }> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching budget for category:', error);
      return { error: error.message };
    }

    return data;
  },

  async createBudget(budget: DBBudgetInsert, supabase: SupabaseClient): Promise<DBBudget | { error: string }> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      return { error: error.message };
    }

    return data;
  },

  async updateBudget(id: string, updates: DBBudgetUpdate, supabase: SupabaseClient): Promise<DBBudget | { error: string }> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return { error: error.message };
    }

    return data;
  },

  async deleteBudget(id: string, supabase: SupabaseClient): Promise<{ success: boolean } | { error: string }> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      return { error: error.message };
    }

    return { success: true };
  },

  async getBudgetProgress(userId: string, supabase: SupabaseClient): Promise<Record<string, { allocated: number, spent: number, remaining: number, status: string }> | { error: string }> {
    // Get all budgets for the user
    const budgets = await this.getBudgets(userId, supabase);
    
    if ('error' in budgets) {
      return budgets;
    }

    // Get expenses by category
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching expenses for budget progress:', error);
      return { error: error.message };
    }

    // Calculate progress for each budget
    const progress: Record<string, { allocated: number, spent: number, remaining: number, status: string }> = {};
    
    budgets.forEach(budget => {
      const categoryId = budget.category_id;
      const allocated = budget.amount || 0;
      
      // Sum expenses for this category
      const spent = expenses
        .filter(expense => expense.category_id === categoryId)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      const remaining = allocated - spent;
      
      // Determine status
      let status = 'on-track';
      if (remaining < 0) {
        status = 'exceeded';
      } else if (remaining / allocated < 0.2) { // Less than 20% remaining
        status = 'warning';
      }
      
      progress[categoryId || 'Other'] = { allocated, spent, remaining, status };
    });

    return progress;
  }
};

