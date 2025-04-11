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

        const supabase = await createClient();
        const stats = await SubscriptionsService.getSubscriptionStats(userId, supabase);
        
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching subscription stats:', error);
        return NextResponse.json({ error: 'Failed to fetch subscription stats' }, { status: 500 });
    }
} 