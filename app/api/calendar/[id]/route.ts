import { NextRequest, NextResponse } from 'next/server';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/services/calendar-service';
import { supabase } from '@/lib/server/supabase/client';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/server/supabase/server';
import { UpdateCalendarEvent } from '@/types/supabase';

// Function to verify ownership of the event
async function verifyOwnership(eventId: string, userId: string): Promise<boolean> {
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

// PUT endpoint to update a calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const userId = await getAuthenticatedUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify that the user owns this event
    const isOwner = await verifyOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Prevent changing the user_id
    delete body.user_id;
    
    const updatedEvent = await updateCalendarEvent(id, body);
    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error(`Error in PUT /api/calendar/${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

// DELETE endpoint to delete a calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const userId = await getAuthenticatedUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify that the user owns this event
    const isOwner = await verifyOwnership(id, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    await deleteCalendarEvent(id);
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/calendar/${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
} 