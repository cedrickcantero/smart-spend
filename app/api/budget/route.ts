import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/budget-service';
import { DBBudgetInsert} from '@/types/supabase';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { createClient } from '@/lib/supabase/server';

// GET all budgets
export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        const supabase = await createClient();
        
        const budgets = await BudgetService.getBudgets(userId, supabase);
        
        return NextResponse.json(budgets);
      } catch (error) {
        console.error('Error fetching budgets:', error);
        return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
      }
}

// POST create a new budget
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    const body = await request.json();
    const requiredFields = ['amount', 'category_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Extract budget_name if present
    const { budget_name, ...budgetFields } = body;
    
    // Prepare data for insertion with any additional custom fields
    const budgetData: DBBudgetInsert = {
      ...budgetFields,
      user_id: userId
    };

    // Add budget_name as a custom field if provided
    if (budget_name) {
      // We'll handle this in the service layer or through a database trigger
      // since it's not part of the standard schema
    }

    const result = await BudgetService.createBudget({
      ...budgetData,
      ...(budget_name && { budget_name })
    }, supabase);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}