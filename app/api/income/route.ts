import { getAuthenticatedUserId } from '@/lib/server/auth';
import { IncomeService } from '@/lib/services/income-service';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const supabase = await createClient();
      
        const income = await IncomeService.getIncome(userId, supabase);
        return NextResponse.json(income);
    } catch (error) {
        console.error('Error fetching income:', error);
        return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }   

        const supabase = await createClient();
        const incomeData = await request.json();
        
        const incomeWithUserId = {
            ...incomeData,
            user_id: userId
        };
        
        const income = await IncomeService.createIncome(incomeWithUserId, supabase);
        return NextResponse.json(income);
    } catch (error) {
        console.error('Error creating income:', error);
        return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
    }
} 

export async function DELETE(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const incomeData = await request.json();

        const income = await IncomeService.deleteIncome(incomeData, supabase);
        return NextResponse.json(income);
    } catch (error) {
        console.error('Error deleting income:', error);
        return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
    }
}