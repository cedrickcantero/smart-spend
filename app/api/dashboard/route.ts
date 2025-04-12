import { getAuthenticatedUserId } from "@/lib/server/auth";
import { DashboardService } from "@/lib/services/dashboard-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try{
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const supabase = await createClient();
      
        const dashboardData = await DashboardService.getDashboardData(userId, supabase);
        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
