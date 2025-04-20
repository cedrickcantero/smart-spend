import { SupabaseClient } from '@supabase/supabase-js';
import { DBFeedback, DBFeedbackInsert, DBFeedbackUpdate } from '@/types/supabase';

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
    // Use two separate queries to avoid the join issue
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();
    
    if (feedbackError) {
      if (feedbackError.code === 'PGRST116') {
        return null; // No rows found
      }
      console.error(`Error fetching feedback with ID ${id}:`, feedbackError);
      return { error: feedbackError.message };
    }
    
    if (feedbackData) {
      // Get user info from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(feedbackData.user_id);
      
      if (userError) {
        console.error(`Error fetching user data for user ID ${feedbackData.user_id}:`, userError);
      }
      
      return {
        ...feedbackData,
        profiles: userData?.user ? {
          email: userData.user.email || '',
          first_name: userData.user.user_metadata?.first_name,
          last_name: userData.user.user_metadata?.last_name
        } : undefined
      };
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
    // Use a simple query without joins
    const { data: feedbackList, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching feedback with status ${status}:`, error);
      return { error: error.message };
    }
    
    // If we have feedback results, fetch the user data separately
    if (feedbackList && feedbackList.length > 0) {
      const enrichedFeedback = await Promise.all(
        feedbackList.map(async (feedback) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(feedback.user_id);
          
          if (userError) {
            console.error(`Error fetching user data for user ID ${feedback.user_id}:`, userError);
            return feedback;
          }
          
          return {
            ...feedback,
            profiles: userData?.user ? {
              email: userData.user.email || '',
              first_name: userData.user.user_metadata?.first_name,
              last_name: userData.user.user_metadata?.last_name
            } : undefined
          };
        })
      );
      
      return enrichedFeedback;
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
    
    // If we have feedback results, fetch the user data separately
    if (feedbackList && feedbackList.length > 0) {
      const enrichedFeedback = await Promise.all(
        feedbackList.map(async (feedback) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(feedback.user_id);
          
          if (userError) {
            console.error(`Error fetching user data for user ID ${feedback.user_id}:`, userError);
            return feedback;
          }
          
          return {
            ...feedback,
            profiles: userData?.user ? {
              email: userData.user.email || '',
              first_name: userData.user.user_metadata?.first_name,
              last_name: userData.user.user_metadata?.last_name
            } : undefined
          };
        })
      );
      
      return enrichedFeedback;
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
    
    // If we have feedback results, fetch the user data separately
    if (feedbackList && feedbackList.length > 0) {
      const enrichedFeedback = await Promise.all(
        feedbackList.map(async (feedback) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(feedback.user_id);
          
          if (userError) {
            console.error(`Error fetching user data for user ID ${feedback.user_id}:`, userError);
            return feedback;
          }
          
          return {
            ...feedback,
            profiles: userData?.user ? {
              email: userData.user.email || '',
              first_name: userData.user.user_metadata?.first_name,
              last_name: userData.user.user_metadata?.last_name
            } : undefined
          };
        })
      );
      
      return enrichedFeedback;
    }
    
    return feedbackList || [];
  },
  
  async getAllUsers(supabase: SupabaseClient): Promise<{ id: string; email: string; first_name?: string; last_name?: string }[] | { error: string }> {
    try {
      // The admin.listUsers method requires admin permissions
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error fetching users:', error);
        return { error: error.message };
      }
      
      return data.users.map(user => ({
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return { error: 'Failed to fetch users' };
    }
  }
};

