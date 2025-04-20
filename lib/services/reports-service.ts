import { SupabaseClient } from '@supabase/supabase-js';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, format, parseISO, subYears } from 'date-fns';
import { ColorService } from './color-service';

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface ExpenseTrend {
  date: string;
  amount: number;
}

export interface MonthlyComparison {
  name: string; // Month name (Jan, Feb, etc.)
  current: number;
  previous: number;
}

export interface TopExpense {
  title: string;
  amount: number;
  category: string;
  color: string;
  percentage: number;
}

export interface ReportSummary {
  totalExpenses: number;
  averageDaily: number;
  topCategory: {
    name: string;
    value: number;
    percentage: number;
  };
  transactionCount: number;
  previousTotal: number;
  previousChange: number;
}

// Category colors
const categoryColors: Record<string, string> = {
  'food': '#0ea5e9',
  'housing': '#3b82f6',
  'transportation': '#22c55e',
  'entertainment': '#eab308',
  'shopping': '#ef4444',
  'utilities': '#8b5cf6',
  'health': '#ec4899',
  'travel': '#64748b',
  'education': '#0d9488',
  'personal': '#f59e0b',
  'other': '#94a3b8'
};

// Fallback colors for categories without a specific color
const fallbackColors = [
  '#0ea5e9', '#3b82f6', '#22c55e', '#eab308', '#ef4444', 
  '#8b5cf6', '#ec4899', '#64748b', '#0d9488', '#f59e0b'
];

export const ReportsService = {
  // Get date range based on timeframe
  getDateRange: (timeframe: string, customRange?: { start: Date; end: Date }) => {
    const now = new Date();
    
    switch(timeframe) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { start: startOfWeek, end: endOfWeek };
      
      case 'month':
        return { 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        };
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return { start: startOfQuarter, end: endOfQuarter };
      
      case 'year':
        return { 
          start: startOfYear(now), 
          end: endOfYear(now) 
        };
      
      case 'custom':
        return customRange || { start: startOfMonth(now), end: endOfMonth(now) };
      
      default:
        return { 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        };
    }
  },

  // Get report summary for the selected timeframe
  getReportSummary: async (
    userId: string,
    timeframe: string,
    supabase: SupabaseClient,
    customRange?: { start: Date; end: Date }
  ): Promise<ReportSummary> => {
    const { start, end } = ReportsService.getDateRange(timeframe, customRange);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Get current period expenses
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr);

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average daily expense
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const averageDaily = totalExpenses / daysDiff;
    
    // Get previous period data for comparison
    let previousStart, previousEnd;
    
    switch(timeframe) {
      case 'month':
        previousStart = startOfMonth(subMonths(start, 1));
        previousEnd = endOfMonth(subMonths(end, 1));
        break;
      case 'year':
        previousStart = startOfYear(subYears(start, 1));
        previousEnd = endOfYear(subYears(end, 1));
        break;
      // For other timeframes, just go back the same number of days
      default:
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        previousEnd = new Date(start);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousEnd.getDate() - days + 1);
    }
    
    const previousStartStr = format(previousStart, 'yyyy-MM-dd');
    const previousEndStr = format(previousEnd, 'yyyy-MM-dd');
    
    // Get previous period expenses
    const { data: previousExpenses, error: prevError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', previousStartStr)
      .lte('date', previousEndStr);
    
    if (prevError) {
      console.error('Error fetching previous expenses:', prevError);
      throw prevError;
    }
    
    const previousTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousChange = previousTotal > 0 
      ? ((totalExpenses - previousTotal) / previousTotal) * 100 
      : 0;
    
    // Find top category
    const categoryTotals: Record<string, number> = {};
    
    // Get categories for each expense
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId);
    
    const categoryMap: Record<string, string> = {};
    if (categories) {
      categories.forEach(cat => {
        categoryMap[cat.id] = cat.name;
      });
    }
    
    // Sum by category
    expenses.forEach(expense => {
      const categoryName = expense.category_id 
        ? (categoryMap[expense.category_id] || 'Other')
        : 'Other';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += expense.amount;
    });
    
    // Find the top category
    let topCategoryName = 'Other';
    let topCategoryValue = 0;
    
    Object.entries(categoryTotals).forEach(([name, value]) => {
      if (value > topCategoryValue) {
        topCategoryName = name;
        topCategoryValue = value;
      }
    });
    
    return {
      totalExpenses,
      averageDaily,
      topCategory: {
        name: topCategoryName,
        value: topCategoryValue,
        percentage: totalExpenses > 0 ? (topCategoryValue / totalExpenses) * 100 : 0
      },
      transactionCount: expenses.length,
      previousTotal,
      previousChange
    };
  },
  
  // Get category breakdown
  getCategoryBreakdown: async (
    userId: string,
    timeframe: string,
    supabase: SupabaseClient,
    customRange?: { start: Date; end: Date }
  ): Promise<CategoryBreakdown[]> => {
    const { start, end } = ReportsService.getDateRange(timeframe, customRange);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Get expenses for the period
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*, categories!expenses_category_id_fkey(id, name, color)')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr);

    if (error) {
      console.error('Error fetching expenses for category breakdown:', error);
      throw error;
    }

    // Group by category
    const categoryTotals: Record<string, { total: number; color: string }> = {};

    const { data: colors, error: colorError } = await ColorService.getColors(supabase);

    if (colorError) {
      console.error('Error fetching colors:', colorError);
      throw colorError;
    }

    console.log("colors", colors)
    console.log("expenses", expenses)

    // Create a color lookup map for quick access
    const colorMap: Record<string, string> = {};
    if (colors) {
      colors.forEach(color => {
        colorMap[color.id] = color.hex_value;
      });
    }
    
    expenses.forEach(expense => {
      const category = expense.categories;
      const categoryName = category ? category.name : 'Other';
      
      // Get the color using the ID from the color map, or fall back to defaults
      let categoryColor = '#94a3b8'; // Default slate color
      
      if (category) {
        if (category.color && colorMap[category.color]) {
          categoryColor = colorMap[category.color];
        } else if (categoryColors[categoryName.toLowerCase()]) {
          categoryColor = categoryColors[categoryName.toLowerCase()];
        }
      }
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { total: 0, color: categoryColor };
      }
      categoryTotals[categoryName].total += expense.amount;
    });
    
    // Convert to array
    const result: CategoryBreakdown[] = Object.entries(categoryTotals)
      .map(([name, { total, color }], index) => ({
        name,
        value: total,
        color: color || fallbackColors[index % fallbackColors.length]
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
    
    return result;
  },
  
  // Get expense trends over time
  getExpenseTrends: async (
    userId: string,
    timeframe: string,
    supabase: SupabaseClient,
    customRange?: { start: Date; end: Date }
  ): Promise<ExpenseTrend[]> => {
    const { start, end } = ReportsService.getDateRange(timeframe, customRange);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Get expenses for the period
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching expenses for trends:', error);
      throw error;
    }

    // Group by day/week/month depending on timeframe
    const groupByKey: Record<string, number> = {};
    
    expenses.forEach(expense => {
      let key;
      
      // Group by day, week, or month based on timeframe
      if (timeframe === 'month') {
        key = expense.date; // Group by day for month view
      } else if (timeframe === 'quarter') {
        const date = parseISO(expense.date);
        key = format(date, 'yyyy-MM'); // Group by month for quarter view
      } else if (timeframe === 'year') {
        const date = parseISO(expense.date);
        key = format(date, 'yyyy-MM'); // Group by month for year view
      } else {
        key = expense.date; // Default to daily
      }
      
      if (!groupByKey[key]) {
        groupByKey[key] = 0;
      }
      groupByKey[key] += expense.amount;
    });
    
    // Convert to array
    const result: ExpenseTrend[] = Object.entries(groupByKey)
      .map(([date, amount]) => ({
        date,
        amount
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending
    
    return result;
  },
  
  // Get monthly comparison data
  getMonthlyComparison: async (
    userId: string,
    year: number,
    supabase: SupabaseClient
  ): Promise<MonthlyComparison[]> => {
    const currentYear = year || new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Get expenses for current year
    const { data: currentYearData, error: currentError } = await supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', `${currentYear}-01-01`)
      .lte('date', `${currentYear}-12-31`);

    if (currentError) {
      console.error('Error fetching current year expenses:', currentError);
      throw currentError;
    }
    
    // Get expenses for previous year
    const { data: previousYearData, error: previousError } = await supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', userId)
      .gte('date', `${previousYear}-01-01`)
      .lte('date', `${previousYear}-12-31`);

    if (previousError) {
      console.error('Error fetching previous year expenses:', previousError);
      throw previousError;
    }

    // Group by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentByMonth: number[] = Array(12).fill(0);
    const previousByMonth: number[] = Array(12).fill(0);
    
    currentYearData.forEach(expense => {
      const date = parseISO(expense.date);
      const month = date.getMonth();
      currentByMonth[month] += expense.amount;
    });
    
    previousYearData.forEach(expense => {
      const date = parseISO(expense.date);
      const month = date.getMonth();
      previousByMonth[month] += expense.amount;
    });
    
    // Build result
    const result: MonthlyComparison[] = monthNames.map((name, index) => ({
      name,
      current: currentByMonth[index],
      previous: previousByMonth[index]
    }));
    
    return result;
  },
  
  // Get top expenses
  getTopExpenses: async (
    userId: string,
    timeframe: string,
    limit: number = 5,
    supabase: SupabaseClient,
    customRange?: { start: Date; end: Date }
  ): Promise<TopExpense[]> => {
    const { start, end } = ReportsService.getDateRange(timeframe, customRange);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    // Get expenses for the period
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*, categories!expenses_category_id_fkey(id, name, color)')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('amount', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top expenses:', error);
      throw error;
    }

    // Calculate total for percentages
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr);
    
    const total = allExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    
    // Map to TopExpense interface
    const result: TopExpense[] = expenses.map(expense => {
      const category = expense.categories;
      return {
        title: expense.merchant || 'Unknown',
        amount: expense.amount,
        category: category ? category.name : 'Other',
        color: category 
          ? (category.color || categoryColors[(category.name || '').toLowerCase()] || '#94a3b8')
          : '#94a3b8',
        percentage: total > 0 ? (expense.amount / total) * 100 : 0
      };
    });
    
    return result;
  }
};
