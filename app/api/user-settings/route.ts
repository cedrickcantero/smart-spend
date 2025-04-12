import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { UserSettingsService } from '@/lib/services/user-settings-service';
import { DBUserSettings } from '@/types/supabase';

// GET handler to fetch user settings
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    
    if (path) {
      const pathArray = path.split('.');
      const result = await UserSettingsService.getUserSettingsByPath(
        userId,
        pathArray,
        supabase
      );
      
      if ('error' in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result);
    }
    
    const settings = await UserSettingsService.getUserSettings(userId, supabase);;
    
    if ('error' in settings) {
      return NextResponse.json(
        { error: settings.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/user-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    const { settings } = body;
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }
    
    const result = await UserSettingsService.updateUserSettings(
      userId,
      settings as DBUserSettings,
      supabase
    );
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/user-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    
    const body = await request.json();
    const { path, value } = body;
    
    if (!path || value === undefined) {
      return NextResponse.json(
        { error: 'Path and value are required' },
        { status: 400 }
      );
    }
    
    const pathArray = Array.isArray(path) ? path : path.split('.');
    
    const result = await UserSettingsService.updateUserSetting(
      userId,
      pathArray,
      value,
      supabase
    );
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PATCH /api/user-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
