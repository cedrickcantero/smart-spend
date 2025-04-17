import { SupabaseClient } from '@supabase/supabase-js';
import { DBIncome } from '@/types/supabase';

export type DBIncomeInsert = Omit<DBIncome, 'id' | 'created_at' | 'updated_at'>;
export type DBIncomeUpdate = Partial<Omit<DBIncome, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

export const IncomeService = {
  async getIncome(userId: string, supabase: SupabaseClient): Promise<DBIncome[] | { error: string }> {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching income:', error);
      return { error: error.message };
    }

    return data || [];
  },

  async getIncomeForDate(date: string, userId: string, supabase: SupabaseClient): Promise<DBIncome[] | { error: string }> {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching income for date:', error);
      return { error: error.message };
    }

    return data || [];
  },

  async createIncome(income: DBIncomeInsert, supabase: SupabaseClient): Promise<DBIncome | { error: string }> {
    const { data, error } = await supabase
      .from('income')
      .insert(income)
      .select()
      .single();

    if (error) {
      console.error('Error creating income:', error);
      return { error: error.message };
    }

    return data;
  },

  async updateIncome(id: string, updates: DBIncomeUpdate, supabase: SupabaseClient): Promise<DBIncome | { error: string }> {
    const { data, error } = await supabase
      .from('income')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating income:', error);
      return { error: error.message };
    }

    return data;
  },

  async deleteIncome(id: string, supabase: SupabaseClient): Promise<void | { error: string }> {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting income:', error);
      return { error: error.message };
    }
  },

  async getIncomeByCategory(userId: string, supabase: SupabaseClient): Promise<Record<string, number> | { error: string }> {
    const income = await this.getIncome(userId, supabase);
    
    if ('error' in income) {
      return income;
    }

    const categories: Record<string, number> = {};
    
    income.forEach(income => {
      const category = income.category_id || 'Other';
      categories[category] = (categories[category] || 0) + (income.amount || 0);
    });

    return categories;
  }
}; 