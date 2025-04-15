import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ReportsService } from '@/lib/services/reports-service';
import { getAuthenticatedUserId } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters
    const reportType = searchParams.get('type') || 'summary';
    const timeframe = searchParams.get('timeframe') || 'month';
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);
    
    // Handle custom date range if provided
    let customRange;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate && endDate) {
      customRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }
    
    let data;
    
    // Call appropriate service method based on report type
    switch (reportType) {
      case 'summary':
        data = await ReportsService.getReportSummary(userId, timeframe, supabase, customRange);
        break;
      
      case 'categoryBreakdown':
        data = await ReportsService.getCategoryBreakdown(userId, timeframe, supabase, customRange);
        break;
      
      case 'trends':
        data = await ReportsService.getExpenseTrends(userId, timeframe, supabase, customRange);
        break;
      
      case 'monthlyComparison':
        data = await ReportsService.getMonthlyComparison(userId, year, supabase);
        break;
      
      case 'topExpenses':
        data = await ReportsService.getTopExpenses(userId, timeframe, limit, supabase, customRange);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

