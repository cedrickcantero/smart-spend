import { SupabaseClient } from '@supabase/supabase-js';
import { DBCalendarEvent, DBCalendarEventInsert, DBCalendarEventUpdate } from '@/types/supabase';

export const calendarService = {
  async getCalendarEvents(userId: string, supabase: SupabaseClient): Promise<DBCalendarEvent[] | { error: string }> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching calendar events:', error);
      return { error: error.message };
    }

    return data || [];
  },
  async getCalendarEventsForDate(date: string, userId: string, supabase: SupabaseClient): Promise<DBCalendarEvent[] | { error: string }> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching calendar events for date:', error);
      return { error: error.message };
    }

    return data || [];
  },
  async createCalendarEvent(event: DBCalendarEventInsert, supabase: SupabaseClient): Promise<DBCalendarEvent | { error: string }> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      return { error: error.message };
    }

    return data;
  },
  async updateCalendarEvent(id: string, updates: DBCalendarEventUpdate, supabase: SupabaseClient): Promise<DBCalendarEvent | { error: string }> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      return { error: error.message };
    }

    return data;
  },
  async deleteCalendarEvent(id: string, supabase: SupabaseClient): Promise<{ success: boolean } | { error: string }> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar event:', error);
      return { error: error.message };
    }
    
    return { success: true };
  }
};