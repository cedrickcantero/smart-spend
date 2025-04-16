import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ColorService } from '@/lib/services/color-service';
import { getAuthenticatedUserId } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    const { data, error } = await ColorService.getColors(supabase);
    
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    const body = await request.json();
    
    const result = await ColorService.createColor(body, supabase);
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
}
