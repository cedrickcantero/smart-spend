import { api } from "@/lib/services/api-service"
import { DBCalendarEvent, DBCalendarEventInsert } from "@/types/supabase"

export const CalendarService = {
  getCalendarEvents: async (): Promise<DBCalendarEvent[]> => {
    try {
      return await api.get<DBCalendarEvent[]>("/api/calendar");
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }
  },

  getCalendarEventsForDate: async (date: string): Promise<DBCalendarEvent[]> => {
    try {
      return await api.get<DBCalendarEvent[]>(`/api/calendar?date=${encodeURIComponent(date)}`);
    } catch (error) {
      console.error(`Error fetching calendar events for date ${date}:`, error);
      throw error;
    }
  },

  createCalendarEvent: async (event: DBCalendarEventInsert): Promise<DBCalendarEvent> => {
    try {
      return await api.post<DBCalendarEvent>("/api/calendar", event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  },

  updateCalendarEvent: async (event: DBCalendarEvent): Promise<DBCalendarEvent> => {
    try {
      if (!event.id) {
        throw new Error('Event ID is required');
      }
      return await api.put<DBCalendarEvent>(`/api/calendar/${event.id}`, event);
    } catch (error) {
      console.error(`Error updating calendar event ${event.id}:`, error);
      throw error;
    }
  },

  deleteCalendarEvent: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/calendar/${id}`);
    } catch (error) {
      console.error(`Error deleting calendar event ${id}:`, error);
      throw error;
    }
  }
}
