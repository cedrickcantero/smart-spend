import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { ColorsService } from "@/lib/services/colors-service";

// Add Cache-Control header with a long TTL since colors rarely change
const CACHE_MAX_AGE = 60 * 60; // 1 hour in seconds

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const colors = await ColorsService.getColors(supabase);
        
        // Add error check for the colors result
        if ('error' in colors) {
            console.error('Error in colors service:', colors.error);
            return NextResponse.json({ error: colors.error }, { status: 500 });
        }

        // Return data with cache headers
        return NextResponse.json(colors, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`,
                'Vary': 'Authorization'
            }
        });
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
        const color = await request.json();
        const result = await ColorsService.createColor(color, supabase);

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating color:', error);
        return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
    }
}