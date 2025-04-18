import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { FinancialData, getFinancialInsights } from "@/lib/services/ai-service";
import { DashboardService } from "@/lib/services/dashboard-service";

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' }, 
        { status: 500 }
      );
    }

    const supabase = await createClient();
    
    const { data: userSettingsData, error: userSettingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userSettingsError) {
      console.error('Error fetching user settings:', userSettingsError);
      return NextResponse.json(
        { error: 'Failed to fetch user settings' },
        { status: 500 }
      );
    }
    
    const userSettings = userSettingsData.settings;
    
    if (userSettings?.security?.aiFeatures === false) {
      return NextResponse.json(
        { error: 'AI features are disabled in user settings' },
        { status: 403 }
      );
    }
    
    try {
      const expensesResult = await DashboardService.getExpenses(userId, supabase);
      
      if ('error' in expensesResult) {
        throw new Error(expensesResult.error);
      }
      
      const dashboardResult = await DashboardService.getDashboardData(userId, supabase);
      
      if ('error' in dashboardResult) {
        throw new Error(dashboardResult.error);
      }
      
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);
        
      if (budgetsError) {
        throw budgetsError;
      }
      
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId);
        
      if (incomeError) {
        throw incomeError;
      }
      
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId);
        
      if (categoriesError) {
        throw categoriesError;
      }
      
      const categoryMap = new Map();
      categories.forEach(category => {
        categoryMap.set(category.id, category.name);
      });
      
      const financialData: FinancialData = {
        expenses: expensesResult.map(expense => ({
          amount: expense.amount,
          category: categoryMap.get(expense.category_id) || 'Uncategorized',
          date: expense.date
        })),
        income: incomeData.map(income => ({
          amount: income.amount,
          source: income.source || 'Other',
          date: income.date
        })),
        budgets: budgetsData.map(budget => ({
          category: categoryMap.get(budget.category_id) || 'Uncategorized',
          amount: budget.amount,
          spent: budget.spent || 0
        })),
        savingsGoals: dashboardResult.savingsGoal ? [dashboardResult.savingsGoal] : []
      };
      
      try {
        const insights = await getFinancialInsights(
          financialData,
          userSettings,
          apiKey
        );
        
        return NextResponse.json(insights);
      } catch (error) {
        console.error('Error generating AI insights:', error);
        return NextResponse.json(
          { error: 'Failed to generate insights' },
          { status: 500 }
        );
      }
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return NextResponse.json(
        { error: 'Failed to generate insights' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in AI insights route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 