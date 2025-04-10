import { NextRequest } from "next/server";
import { ExpenseService } from "@/lib/services/expense-service";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";


export async function GET(request: NextRequest) {
    try{
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        const date = request.nextUrl.searchParams.get('date');
        if (date) {
            const expenses = await ExpenseService.getExpensesForDate(date, userId, supabase);
            return NextResponse.json(expenses);
        }
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching expenses by category:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses by category' }, { status: 500 });
    }
}   