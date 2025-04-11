import { api } from "@/lib/services/api-service";
import { DBSubscription, ClientSubscriptionInsert, ClientSubscriptionUpdate } from "@/types/supabase";

export const SubscriptionsService = {
  getSubscriptions: async (): Promise<DBSubscription[]> => {
    try {
      return await api.get<DBSubscription[]>("/api/subscriptions");
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  },
  
  getSubscription: async (id: string): Promise<DBSubscription> => {
    try {
      return await api.get<DBSubscription>(`/api/subscriptions/${id}`);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      throw error;
    }
  },
  
  createSubscription: async (subscription: ClientSubscriptionInsert): Promise<DBSubscription> => {
    try {
      return await api.post<DBSubscription>("/api/subscriptions", subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },
  
  updateSubscription: async (subscription: ClientSubscriptionUpdate): Promise<DBSubscription> => {
    try {
      return await api.put<DBSubscription>(`/api/subscriptions/${subscription.id}`, subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  },
  
  deleteSubscription: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/subscriptions/${id}`);
    } catch (error) {
      console.error("Error deleting subscription:", error);
      throw error;
    }
  },
  
  getUpcomingSubscriptions: async (days: number = 30): Promise<DBSubscription[]> => {
    try {
      return await api.get<DBSubscription[]>(`/api/subscriptions/upcoming?days=${days}`);
    } catch (error) {
      console.error("Error fetching upcoming subscriptions:", error);
      throw error;
    }
  }
};
