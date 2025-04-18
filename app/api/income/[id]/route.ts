import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { IncomeService } from "@/lib/services/income-service";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Income ID is required' }, { status: 400 });
        }

        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        
        const { data, error } = await supabase
            .from('income')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
            
        if (error) {
            return NextResponse.json({ error: 'Income not found' }, { status: 404 });
        }
            
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching income:', error);
        return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Income ID is required' }, { status: 400 });
        }

        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const updateData = await request.json();
        
        const updatedIncome = await IncomeService.updateIncome(id, updateData, supabase);
        return NextResponse.json(updatedIncome);
    } catch (error) {
        console.error('Error updating income:', error);
        return NextResponse.json({ error: 'Failed to update income' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Income ID is required' }, { status: 400 });
        }

        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        
        await IncomeService.deleteIncome(id, supabase);
        return NextResponse.json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
    }
} 