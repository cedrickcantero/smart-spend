import { getAuthenticatedUserId } from "@/lib/server/auth";
import { SubscriptionsService } from "@/lib/services/subscriptions-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const subscription = await SubscriptionsService.getSubscription(id, supabase);
        
        // Check if the subscription belongs to the user
        if ('error' in subscription) {
            return NextResponse.json({ error: subscription.error }, { status: 404 });
        }
        
        if (subscription.user_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const subscriptionData = await request.json();
        
        // Check if the subscription exists and belongs to the user
        const existingSubscription = await SubscriptionsService.getSubscription(id, supabase);
        if ('error' in existingSubscription) {
            return NextResponse.json({ error: existingSubscription.error }, { status: 404 });
        }
        
        if (existingSubscription.user_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const subscription = await SubscriptionsService.updateSubscription(id, subscriptionData, supabase);
        return NextResponse.json(subscription);
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        
        // Check if the subscription exists and belongs to the user
        const existingSubscription = await SubscriptionsService.getSubscription(id, supabase);
        if ('error' in existingSubscription) {
            return NextResponse.json({ error: existingSubscription.error }, { status: 404 });
        }
        
        if (existingSubscription.user_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const result = await SubscriptionsService.deleteSubscription(id, supabase);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deleting subscription:', error);
        return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
    }
}