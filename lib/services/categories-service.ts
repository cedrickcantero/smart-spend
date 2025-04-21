import { SupabaseClient } from '@supabase/supabase-js';
import { DBCategory, DBColor } from '@/types/supabase';
import { Database } from '@/types/supabase/schema';

// Define an extended type that includes the colorObj property
interface CategoryWithColor extends DBCategory {
  colorObj?: DBColor | null;
}

export const CategoriesService = {
  async getCategories(userId: string, supabase: SupabaseClient<Database>): Promise<CategoryWithColor[] | { error: string }> {
    try {
      // Fetch categories with their color information in a single query
      // We're using a more efficient approach - fetch all categories and colors in parallel
      const [categoriesResult, colorsResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('colors')
          .select('*')
      ]);

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      const categories = categoriesResult.data || [];
      
      if (categories.length === 0) {
        return [];
      }

      // Get colors (handle potential error but don't fail the whole request)
      const colors = colorsResult.error ? [] : (colorsResult.data || []);
      
      // Create a colors lookup map for faster access
      const colorsMap = new Map();
      colors.forEach(color => {
        colorsMap.set(color.id, color);
      });

      // Map color information to each category using the lookup map
      const categoriesWithColors = categories.map(category => {
        const colorObj = category.color ? colorsMap.get(category.color) || null : null;
        
        return {
          ...category,
          colorObj
        } as CategoryWithColor;
      });

      return categoriesWithColors;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
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

    return data || { error: 'Category not found' };
  },
  
  // Get a single category with its color object
  async getCategoryById(categoryId: string, userId: string, supabase: SupabaseClient<Database>): Promise<CategoryWithColor | { error: string }> {
    try {
      // Fetch the specific category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();

      if (categoryError) {
        throw categoryError;
      }

      if (!category) {
        return { error: 'Category not found' };
      }

      // If category has a color ID, fetch the color
      if (category.color) {
        const { data: color, error: colorError } = await supabase
          .from('colors')
          .select('*')
          .eq('id', category.color)
          .single();

        if (colorError) {
          console.error('Error fetching color:', colorError);
          // Continue even if color fetch fails, just return the category without color
          return { ...category, colorObj: null } as CategoryWithColor;
        } 
        
        if (color) {
          return {
            ...category,
            colorObj: color
          } as CategoryWithColor;
        }
      }

      return { ...category, colorObj: null } as CategoryWithColor;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};
