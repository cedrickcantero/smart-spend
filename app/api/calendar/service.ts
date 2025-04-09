import { api } from "@/lib/api-service"
import { DBCalendarEvent } from "@/types/supabase"

export const CalendarService = {
  getCalendarEvents: async () => {
   return api.get<DBCalendarEvent[]>("/calendar")
  },

  getCalendarEventsForDate: async (date: string) => {
    return api.get<DBCalendarEvent[]>(`/calendar?date=${encodeURIComponent(date)}`)
  },
  createCalendarEvent: async (event: Omit<DBCalendarEvent, 'id' | 'user_id'>) => {
    return api.post('/calendar', {
      method: 'POST',
      data: event,
    })
    
  },
  updateCalendarEvent: async (id: string, updates: Partial<Omit<DBCalendarEvent, 'id' | 'user_id'>>) => {
    return api.put(`/calendar/${id}`, {
      method: 'PUT',
      data: updates,
    })
    
  },
  deleteCalendarEvent: async (id: string) => {
    await api.delete(`/calendar/${id}`)
  }
}
