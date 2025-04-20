import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { ColorsService } from "@/lib/services/colors-service";

// Add Cache-Control header with a long TTL since colors rarely change
const CACHE_MAX_AGE = 60 * 60; // 1 hour in seconds

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: 'Color ID is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const color = await ColorsService.getColorById(id, supabase);
        
        // Add error check for the color result
        if ('error' in color) {
            console.error('Error in colors service:', color.error);
            return NextResponse.json({ error: color.error }, { status: 500 });
        }

        // Return data with cache headers
        return NextResponse.json(color, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 2}`,
                'Vary': 'Authorization'
            }
        });
    } catch (error) {
        console.error('Error fetching color:', error);
        return NextResponse.json({ error: 'Failed to fetch color' }, { status: 500 });
    }
} 