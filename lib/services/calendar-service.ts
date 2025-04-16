import { SupabaseClient } from '@supabase/supabase-js';
import { DBCalendarEvent, DBCalendarEventInsert, DBCalendarEventUpdate } from '@/types/supabase';
import { Database } from '@/types/supabase/schema';

export const calendarService = {
  async getCalendarEvents(userId: string, supabase: SupabaseClient<Database>): Promise<DBCalendarEvent[] | { error: string }> {
    try {
      // Fetch calendar events
      const { data: events, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId);

      if (eventsError) {
        throw eventsError;
      }

      if (!events || events.length === 0) {
        return [];
      }

      // Fetch all colors to map to the events
      const { data: colors, error: colorsError } = await supabase
        .from('colors')
        .select('*');

      if (colorsError) {
        throw colorsError;
      }

      // Map color information to each event
      const eventsWithColors = events.map(event => {
        // Find the color object that matches the event's color ID
        const colorObj = event.color ? colors?.find(c => c.id === event.color) : null;
        
        return {
          ...event,
          colorObj
        };
      });

      return eventsWithColors;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getCalendarEventsForDate(date: string, userId: string, supabase: SupabaseClient<Database>): Promise<DBCalendarEvent[] | { error: string }> {
    try {
      // Fetch calendar events for specific date
      const { data: events, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('date', date)
        .eq('user_id', userId);

      if (eventsError) {
        throw eventsError;
      }

      if (!events || events.length === 0) {
        return [];
      }

      // Fetch all colors to map to the events
      const { data: colors, error: colorsError } = await supabase
        .from('colors')
        .select('*');

      if (colorsError) {
        throw colorsError;
      }

      // Map color information to each event
      const eventsWithColors = events.map(event => {
        // Find the color object that matches the event's color ID
        const colorObj = event.color ? colors?.find(c => c.id === event.color) : null;
        
        return {
          ...event,
          colorObj
        };
      });

      return eventsWithColors;
    } catch (error) {
      console.error('Error fetching calendar events for date:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
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
  },
  async verifyOwnership(eventId: string, userId: string, supabase: SupabaseClient): Promise<boolean> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('user_id')
      .eq('id', eventId)
      .single();
  
    if (error || !data) {
      return false;
    }
  
    return data.user_id === userId;
  }
};