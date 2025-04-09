import { SupabaseClient } from '@supabase/supabase-js';
import { DBExpense, DBExpenseInsert, DBExpenseUpdate } from '@/types/supabase';

export const expenseService = {
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

  async getExpensesForDate(date: string, userId: string, supabase: SupabaseClient): Promise<DBExpense[] | { error: string }> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching expenses for date:', error);
      return { error: error.message };
    }

    return data || [];
  },

  async createExpense(expense: DBExpenseInsert, supabase: SupabaseClient): Promise<DBExpense | { error: string }> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return { error: error.message };
    }

    return data;
  },

  async updateExpense(id: string, updates: DBExpenseUpdate, supabase: SupabaseClient): Promise<DBExpense | { error: string }> {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      return { error: error.message };
    }

    return data;
  },

  async deleteExpense(id: string, supabase: SupabaseClient): Promise<{ success: boolean } | { error: string }> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return { error: error.message };
    }

    return { success: true };
  },

  async getExpensesByCategory(userId: string, supabase: SupabaseClient): Promise<Record<string, number> | { error: string }> {
    const expenses = await this.getExpenses(userId, supabase);
    
    if ('error' in expenses) {
      return expenses;
    }

    const categories: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categories[category] = (categories[category] || 0) + (expense.amount || 0);
    });

    return categories;
  },

  async getUpcomingExpenses(userId: string, days: number = 30, supabase: SupabaseClient): Promise<DBExpense[] | { error: string }> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', todayStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming expenses:', error);
      return { error: error.message };
    }

    return data || [];
  }
};
