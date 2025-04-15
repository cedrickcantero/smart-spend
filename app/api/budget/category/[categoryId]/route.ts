
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { BudgetService } from "@/lib/services/budget-service";


export async function GET(request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }) {
  try{
      const { categoryId } = await context.params;

      if (!categoryId) {
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
      }
  
      const userId = await getAuthenticatedUserId(request);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const supabase = await createClient();
      
      const budget = await BudgetService.getBudgetByCategory(categoryId, userId, supabase);
      
      return NextResponse.json(budget);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
    }
}
