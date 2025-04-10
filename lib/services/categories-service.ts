import { SupabaseClient } from '@supabase/supabase-js';
import { DBCategory, DBExpense, DBExpenseInsert, DBExpenseUpdate } from '@/types/supabase';

export const CategoriesService = {
  async getCategories(userId: string, supabase: SupabaseClient): Promise<DBCategory[] | { error: string }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching expenses:', error);
      return { error: error.message };
    }

    return data || [];
  },
  async createCategory(category: DBCategory, supabase: SupabaseClient): Promise<DBCategory | { error: string }> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return { error: error.message };
    }   

    return data;
  },

  async updateCategory(category: DBCategory, supabase: SupabaseClient): Promise<DBCategory | { error: string }> {
    if (!category.id) {
      return { error: 'Category ID is required for update' };
    }

    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', category.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return { error: error.message };
    }

    return data;
  },
  
  async deleteCategory(category: DBCategory, supabase: SupabaseClient): Promise<DBCategory | { error: string }> {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id);

    if (error) {
      console.error('Error deleting category:', error);
      return { error: error.message };
    }

    return data;
  }
};
