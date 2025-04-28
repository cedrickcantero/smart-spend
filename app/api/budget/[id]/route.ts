import { getAuthenticatedUserId } from "@/lib/server/auth";
import { BudgetService } from "@/lib/services/budget-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest,
    context: { params: Promise<{ id: string }> }) {
    try {
      const { id } = await context.params;
  
      if (!id) {
        return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 });
      }
  
      const userId = await getAuthenticatedUserId(request);
      if (!userId) {  
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const supabase = await createClient();

      const body = await request.json();
  
      const budget = await BudgetService.updateBudget(id, body, supabase);    
  
      return NextResponse.json(budget);
    } catch (error) {
      console.error('Error updating budget:', error);
      return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
    }
  }
  

  export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await context.params;
      
      if (!id) {
        return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
      }
      
      const userId = await getAuthenticatedUserId(request);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const supabase = await createClient();
      
      await BudgetService.deleteBudget(id, supabase);
      return NextResponse.json({ message: 'Budget deleted successfully' });
    } catch (error) {
      console.error('Error deleting budget:', error);
      return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
    }
  }

