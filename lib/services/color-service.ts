import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase/schema';
import { DBColor } from '@/types/supabase';

export class ColorService {
  static async getColors(supabase: SupabaseClient<Database>) {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('name');
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching colors:', error);
      return { data: null, error: 'Failed to fetch colors' };
    }
  }

  static async getColorById(colorId: string, supabase: SupabaseClient<Database>) {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .eq('id', colorId)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error fetching color by ID:', error);
      return { data: null, error: 'Failed to fetch color' };
    }
  }

  static async createColor(color: Omit<DBColor, 'id' | 'created_at' | 'updated_at'>, 
                           supabase: SupabaseClient<Database>) {
    try {
      const { data, error } = await supabase
        .from('colors')
        .insert([color])
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error creating color:', error);
      return { data: null, error: 'Failed to create color' };
    }
  }

  static async updateColor(color: DBColor, supabase: SupabaseClient<Database>) {
    try {
      const { data, error } = await supabase
        .from('colors')
        .update(color)
        .eq('id', color.id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error updating color:', error);
      return { data: null, error: 'Failed to update color' };
    }
  }
  
  static async deleteColor(colorId: string, supabase: SupabaseClient<Database>) {
    try {
      const { data, error } = await supabase
        .from('colors')
        .delete()
        .eq('id', colorId)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting color:', error);
      return { data: null, error: 'Failed to delete color' };
    }
  }
  
  // Method to fetch categories with complete color information
  static async getCategoriesWithColors(userId: string, supabase: SupabaseClient<Database>) {
    try {
      // First, get all the categories
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);
      
      if (categoryError) throw categoryError;
      if (!categories || categories.length === 0) {
        return { data: [], error: null };
      }
      
      // Get all colors
      const { data: colors, error: colorError } = await supabase
        .from('colors')
        .select('*');
      
      if (colorError) throw colorError;
      
      // Map color information to each category
      const categoriesWithColors = categories.map(category => {
        // Find the color object that matches the category's color ID
        const colorObj = colors?.find(c => c.id === category.color) || null;
        
        return {
          ...category,
          colorObj // Include the full color object
        };
      });
      
      return { data: categoriesWithColors, error: null };
    } catch (error) {
      console.error('Error fetching categories with colors:', error);
      return { data: null, error: 'Failed to fetch categories with colors' };
    }
  }
}
