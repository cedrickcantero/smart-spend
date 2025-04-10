import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { ExpenseService } from "@/lib/services/expense-service";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
        }

        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        
        await ExpenseService.deleteExpense(id, supabase);
        return NextResponse.json({  message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
}