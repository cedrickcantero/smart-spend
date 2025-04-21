import { SupabaseClient } from '@supabase/supabase-js';
import { DBFeedback, DBFeedbackInsert } from '@/types/supabase';

export type DBFeedbackInsertClient = Omit<DBFeedbackInsert, 'id' | 'created_at' | 'user_id'>;
export type DBFeedbackUpdateClient = Partial<Omit<DBFeedback, 'id' | 'created_at' | 'user_id'>>;

export const FeedbackService = {
  async getUserFeedback(userId: string, supabase: SupabaseClient): Promise<DBFeedback[] | { error: string }> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user feedback:', error);
      return { error: error.message };
    }
    
    return data || [];
  },
  
  async getFeedbackById(id: string, supabase: SupabaseClient): Promise<DBFeedback | { error: string } | null> {
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();
    
    if (feedbackError) {
      if (feedbackError.code === 'PGRST116') {
        return null;
      }
      console.error(`Error fetching feedback with ID ${id}:`, feedbackError);
      return { error: feedbackError.message };
    }
    
    return feedbackData;
  },

  async createFeedback(feedback: DBFeedbackInsertClient, userId: string, supabase: SupabaseClient): Promise<DBFeedback | { error: string }> {
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        ...feedback,
        user_id: userId,
        is_resolved: false,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating feedback:', error);
      return { error: error.message };
    }
    
    return data;
  },

  async updateFeedback(id: string, updates: DBFeedbackUpdateClient, supabase: SupabaseClient): Promise<DBFeedback | { error: string }> {
    const { data, error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating feedback:', error);
      return { error: error.message };
    }
    
    return data;
  },

  async deleteFeedback(id: string, supabase: SupabaseClient): Promise<void | { error: string }> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting feedback:', error);
      return { error: error.message };
    }
  },
  
  async getFeedbackByStatus(status: string, supabase: SupabaseClient): Promise<DBFeedback[] | { error: string }> {
    const { data: feedbackList, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching feedback with status ${status}:`, error);
      return { error: error.message };
    }
    
    
    return feedbackList || [];
  },
  
  async getFeedbackByType(type: string, supabase: SupabaseClient): Promise<DBFeedback[] | { error: string }> {
    // Use a simple query without joins
    const { data: feedbackList, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('feedback_type', type)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching feedback with type ${type}:`, error);
      return { error: error.message };
    }
    

    
    return feedbackList || [];
  },
  
  async getAllFeedback(supabase: SupabaseClient): Promise<DBFeedback[] | { error: string }> {
    // Use a simple query without the join
    const { data: feedbackList, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all feedback:', error);
      return { error: error.message };
    }
    return feedbackList || [];
  },
}
