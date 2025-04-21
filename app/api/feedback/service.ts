import { api } from "@/lib/services/api-service";

export interface DBFeedback {
  id: string;
  user_id: string;
  feedback_text: string;
  feedback_type: string;
  status: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackWithUserInfo extends DBFeedback {
  profiles?: {
    id?: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }
}

export type FeedbackCreate = Omit<DBFeedback, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const FeedbackService = {
  getFeedback: async (): Promise<FeedbackWithUserInfo[]> => {
    try {
      return await api.get<FeedbackWithUserInfo[]>("/api/feedback");
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  },
  
  getFeedbackById: async (id: string): Promise<FeedbackWithUserInfo> => {
    try {
      return await api.get<FeedbackWithUserInfo>(`/api/feedback/${id}`);
    } catch (error) {
      console.error("Error fetching feedback by ID:", error);
      throw error;
    }
  },
  
  createFeedback: async (feedback: FeedbackCreate): Promise<DBFeedback> => {
    try {
      return await api.post<DBFeedback>("/api/feedback", feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  },
  
  updateFeedbackStatus: async (id: string, status: string): Promise<DBFeedback> => {
    try {
      return await api.put<DBFeedback>(`/api/feedback/${id}/status`, { status });
    } catch (error) {
      console.error("Error updating feedback status:", error);
      throw error;
    }
  },
  
  deleteFeedback: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/feedback/${id}`);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw error;
    }
  },
  
  getFeedbackByType: async (feedbackType: string): Promise<FeedbackWithUserInfo[]> => {
    try {
      return await api.get<FeedbackWithUserInfo[]>(`/api/feedback/type/${feedbackType}`);
    } catch (error) {
      console.error(`Error fetching feedback by type (${feedbackType}):`, error);
      throw error;
    }
  },
  
  getFeedbackByStatus: async (status: string): Promise<FeedbackWithUserInfo[]> => {
    try {
      return await api.get<FeedbackWithUserInfo[]>(`/api/feedback/status/${status}`);
    } catch (error) {
      console.error(`Error fetching feedback by status (${status}):`, error);
      throw error;
    }
  }
} 