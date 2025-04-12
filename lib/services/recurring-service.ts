import { SupabaseClient } from '@supabase/supabase-js';
import { DBExpense, DBExpenseInsert, DBExpenseUpdate } from '@/types/supabase';

export const RecurringService = {
  async getRecurringExpenses(userId: string, supabase: SupabaseClient): Promise<DBExpense[] | { error: string }> {
    const { data, error } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching recurring expenses:', error);
      return { error: error.message };
    }

    return data || [];
  },
  async createRecurringExpense(expense: DBExpenseInsert, supabase: SupabaseClient): Promise<DBExpense | { error: string }> {
    const { data, error } = await supabase
      .from('recurring_bills')
      .insert(expense)
      .select()
      .single();    

    if (error) {
      console.error('Error creating recurring expense:', error);
      return { error: error.message };
    }   

    return data;
  },
  async updateRecurringExpense(id: string, expense: DBExpenseUpdate, supabase: SupabaseClient): Promise<DBExpense | { error: string }> {
    const { data, error } = await supabase
      .from('recurring_bills')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recurring expense:', error);
      return { error: error.message };
    }

    return data;
  },
  async deleteRecurringExpense(id: string, supabase: SupabaseClient): Promise<{ success: boolean } | { error: string }> {
    const {error } = await supabase
      .from('recurring_bills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring expense:', error);
      return { error: error.message };
    }

    return { success: true };
  }
};
