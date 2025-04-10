import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/lib/services/calendar-service';
import { DBCalendarEventInsert } from '@/types/supabase';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { createClient } from '@/lib/supabase/server';

// GET endpoint to fetch calendar events
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client
    const supabase = await createClient();
    
    // Get date parameter
    const date = request.nextUrl.searchParams.get('date');
    
    // Fetch events
    const events = date 
      ? await calendarService.getCalendarEventsForDate(date, userId, supabase)
      : await calendarService.getCalendarEvents(userId, supabase);
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

// POST endpoint to create a new calendar event
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'date', 'amount', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Add user_id to the event
    const event: DBCalendarEventInsert = {
      ...body,
      user_id: userId,
    };
    
    // Create event
    const result = await calendarService.createCalendarEvent(event, supabase);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}