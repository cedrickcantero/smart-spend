import { SupabaseClient } from '@supabase/supabase-js';
import { DBColor } from '@/types/supabase';
import { Database } from '@/types/supabase/schema';

export const ColorsService = {
  async getColors(supabase: SupabaseClient<Database>): Promise<DBColor[] | { error: string }> {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching colors:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  
  async getColorById(colorId: string, supabase: SupabaseClient<Database>): Promise<DBColor | { error: string }> {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .eq('id', colorId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { error: 'Color not found' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching color by ID:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}; 