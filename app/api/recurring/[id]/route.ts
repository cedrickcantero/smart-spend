import { getAuthenticatedUserId } from "@/lib/server/auth";
import { RecurringService } from "@/lib/services/recurring-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest,  context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const recurringExpenseData = await request.json();
        const recurringExpenseWithUserId = {
            ...recurringExpenseData,
            user_id: userId
        };

        const recurringExpense = await RecurringService.updateRecurringExpense(id, recurringExpenseWithUserId, supabase);
        return NextResponse.json(recurringExpense);
    } catch (error) {
        console.error('Error updating recurring expense:', error);
        return NextResponse.json({ error: 'Failed to update recurring expense' }, { status: 500 });
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
        const recurringExpense = await RecurringService.deleteRecurringExpense(id, supabase);
        return NextResponse.json(recurringExpense);
    } catch (error) {
        console.error('Error deleting recurring expense:', error);
        return NextResponse.json({ error: 'Failed to delete recurring expense' }, { status: 500 });
    }
}