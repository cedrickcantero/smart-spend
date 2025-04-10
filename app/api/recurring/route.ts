import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { RecurringService } from "@/lib/services/recurring-service";

export async function GET(request: NextRequest) {
    try{
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const supabase = await createClient();
      
        const recurringExpenses = await RecurringService.getRecurringExpenses(userId, supabase);
        return NextResponse.json(recurringExpenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
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

        const recurringExpense = await RecurringService.createRecurringExpense(recurringExpenseWithUserId, supabase);
        return NextResponse.json(recurringExpense);
    } catch (error) {
        console.error('Error creating recurring expense:', error);
        return NextResponse.json({ error: 'Failed to create recurring expense' }, { status: 500 });
    }
}

