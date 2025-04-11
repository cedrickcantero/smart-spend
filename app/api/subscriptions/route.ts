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
      
        const subscriptions = await SubscriptionsService.getSubscriptions(userId, supabase);
        return NextResponse.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const subscriptionData = await request.json();
        const subscriptionWithUserId = {
            ...subscriptionData,
            user_id: userId
        };

        const subscription = await SubscriptionsService.createSubscription(subscriptionWithUserId, supabase);
        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}

