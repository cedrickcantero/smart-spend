import { api } from "@/lib/services/api-service";
import { 
  CategoryBreakdown, 
  ExpenseTrend, 
  MonthlyComparison, 
  TopExpense, 
  ReportSummary 
} from "@/lib/services/reports-service";

export const ReportService = {
  getReportSummary: async (
    timeframe: string = 'month',
    customRange?: { start: Date; end: Date }
  ): Promise<ReportSummary> => {
    try {
      let url = `/api/reports?type=summary&timeframe=${timeframe}`;
      
      if (customRange) {
        url += `&startDate=${customRange.start.toISOString()}&endDate=${customRange.end.toISOString()}`;
      }
      
      return await api.get<ReportSummary>(url);
    } catch (error) {
      console.error("Error fetching report summary:", error);
      throw error;
    }
  },
  
  getCategoryBreakdown: async (
    timeframe: string = 'month',
    customRange?: { start: Date; end: Date }
  ): Promise<CategoryBreakdown[]> => {
    try {
      let url = `/api/reports?type=categoryBreakdown&timeframe=${timeframe}`;
      
      if (customRange) {
        url += `&startDate=${customRange.start.toISOString()}&endDate=${customRange.end.toISOString()}`;
      }
      
      return await api.get<CategoryBreakdown[]>(url);
    } catch (error) {
      console.error("Error fetching category breakdown:", error);
      throw error;
    }
  },
  
  getExpenseTrends: async (
    timeframe: string = 'month',
    customRange?: { start: Date; end: Date }
  ): Promise<ExpenseTrend[]> => {
    try {
      let url = `/api/reports?type=trends&timeframe=${timeframe}`;
      
      if (customRange) {
        url += `&startDate=${customRange.start.toISOString()}&endDate=${customRange.end.toISOString()}`;
      }
      
      return await api.get<ExpenseTrend[]>(url);
    } catch (error) {
      console.error("Error fetching expense trends:", error);
      throw error;
    }
  },
  
  getMonthlyComparison: async (
    year: number = new Date().getFullYear()
  ): Promise<MonthlyComparison[]> => {
    try {
      const url = `/api/reports?type=monthlyComparison&year=${year}`;
      return await api.get<MonthlyComparison[]>(url);
    } catch (error) {
      console.error("Error fetching monthly comparison:", error);
      throw error;
    }
  },
  
  getTopExpenses: async (
    timeframe: string = 'month',
    limit: number = 5,
    customRange?: { start: Date; end: Date }
  ): Promise<TopExpense[]> => {
    try {
      let url = `/api/reports?type=topExpenses&timeframe=${timeframe}&limit=${limit}`;
      
      if (customRange) {
        url += `&startDate=${customRange.start.toISOString()}&endDate=${customRange.end.toISOString()}`;
      }
      
      return await api.get<TopExpense[]>(url);
    } catch (error) {
      console.error("Error fetching top expenses:", error);
      throw error;
    }
  }
};
