import { getAuthenticatedUserId } from '@/lib/server/auth';
import {ExpenseService} from '@/lib/services/expense-service'
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    try{
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const supabase = await createClient();
      
        const expenses = await ExpenseService.getExpenses(userId, supabase);
        return NextResponse.json(expenses);
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
        const expenseData = await request.json();
        
        const expenseWithUserId = {
            ...expenseData,
            user_id: userId
        };
        
        const expense = await ExpenseService.createExpense(expenseWithUserId, supabase);
        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
    }
}