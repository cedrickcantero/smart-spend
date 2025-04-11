import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionsService } from "@/lib/services/subscriptions-service";

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;
        
        const supabase = await createClient();
        const subscriptions = await SubscriptionsService.getUpcomingSubscriptions(userId, days, supabase);
        
        return NextResponse.json(subscriptions);
    } catch (error) {
        console.error('Error fetching upcoming subscriptions:', error);
        return NextResponse.json({ error: 'Failed to fetch upcoming subscriptions' }, { status: 500 });
    }
} 