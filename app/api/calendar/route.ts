import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/lib/services/calendar-service';
import { handleRequest } from '@/lib/server/handleRequest';
import { DBCalendarEventInsert } from '@/types/supabase';

// GET endpoint to fetch calendar events
export async function GET(request: NextRequest) {
  return handleRequest(request, async ({ user, supabase }) => {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    console.log("user", user);
    
    // If date parameter is provided, fetch events for that date
    if (date) {
      return calendarService.getCalendarEventsForDate(date, user.id, supabase);
    }
    
    // Otherwise fetch all events
    return calendarService.getCalendarEvents(user.id, supabase);
  });
}

// POST endpoint to create a new calendar event
export async function POST(request: NextRequest) {
  return handleRequest(request, async ({ request, user, supabase }) => {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.date || !body.amount || !body.category) {
      throw new Error('Missing required fields: title, date, amount, and category are required');
    }
    
    // Add user_id to the event
    const event: DBCalendarEventInsert = {
      ...body,
      user_id: user.id,
    };
    
    return calendarService.createCalendarEvent(event, supabase);
  });
}