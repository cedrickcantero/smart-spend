import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase/schema';

type DBSubscription = Database['public']['Tables']['subscriptions']['Row'];
type DBSubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type DBSubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export const SubscriptionsService = {
  async getSubscriptions(userId: string, supabase: SupabaseClient): Promise<DBSubscription[] | { error: string }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return { error: error.message };
    }

    return data || [];
  },

  async getSubscription(id: string, supabase: SupabaseClient): Promise<DBSubscription | { error: string }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return { error: error.message };
    }

    return data;
  },

  async createSubscription(subscription: DBSubscriptionInsert, supabase: SupabaseClient): Promise<DBSubscription | { error: string }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return { error: error.message };
    }

    return data;
  },

  async updateSubscription(id: string, updates: DBSubscriptionUpdate, supabase: SupabaseClient): Promise<DBSubscription | { error: string }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return { error: error.message };
    }

    return data;
  },

  async deleteSubscription(id: string, supabase: SupabaseClient): Promise<{ success: boolean } | { error: string }> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscription:', error);
      return { error: error.message };
    }

    return { success: true };
  },

  async getUpcomingSubscriptions(userId: string, days: number = 30, supabase: SupabaseClient): Promise<DBSubscription[] | { error: string }> {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('next_billing_date', todayStr)
      .lte('next_billing_date', endDateStr)
      .order('next_billing_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming subscriptions:', error);
      return { error: error.message };
    }

    return data || [];
  },

  async getSubscriptionStats(userId: string, supabase: SupabaseClient): Promise<{
    totalMonthlyAmount: number;
    totalYearlyAmount: number;
    activeSubscriptions: number;
    upcomingPayments: number;
  } | { error: string }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching subscription stats:', error);
      return { error: error.message };
    }

    const subscriptions = data || [];
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    let totalMonthlyAmount = 0;
    let totalYearlyAmount = 0;
    let upcomingPayments = 0;

    subscriptions.forEach(subscription => {
      const amount = subscription.amount;
      const nextBillingDate = new Date(subscription.next_billing_date);

      // Calculate monthly and yearly amounts based on billing cycle
      switch (subscription.billing_cycle) {
        case 'monthly':
          totalMonthlyAmount += amount;
          totalYearlyAmount += amount * 12;
          break;
        case 'quarterly':
          totalMonthlyAmount += amount / 3;
          totalYearlyAmount += amount * 4;
          break;
        case 'annually':
          totalMonthlyAmount += amount / 12;
          totalYearlyAmount += amount;
          break;
        case 'weekly':
          totalMonthlyAmount += amount * 4;
          totalYearlyAmount += amount * 52;
          break;
        case 'daily':
          totalMonthlyAmount += amount * 30;
          totalYearlyAmount += amount * 365;
          break;
      }

      // Count upcoming payments in the next 30 days
      if (nextBillingDate <= thirtyDaysFromNow) {
        upcomingPayments++;
      }
    });

    return {
      totalMonthlyAmount: Number(totalMonthlyAmount.toFixed(2)),
      totalYearlyAmount: Number(totalYearlyAmount.toFixed(2)),
      activeSubscriptions: subscriptions.length,
      upcomingPayments
    };
  }
}; 