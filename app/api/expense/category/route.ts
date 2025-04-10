import { getAuthenticatedUserId } from "@/lib/server/auth";
import { ExpenseService } from "@/lib/services/expense-service";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try{
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const supabase = await createClient();
        const expenses = await ExpenseService.getExpensesByCategory(userId, supabase);
        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses by category:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses by category' }, { status: 500 });
    }
}   