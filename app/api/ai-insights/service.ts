import { FinancialInsight } from "@/lib/services/ai-service";
import { api } from "@/lib/services/api-service";

export const AIInsightsService = {
    getFinancialInsights: async (): Promise<FinancialInsight[]> => {
        const insights = await api.get<FinancialInsight[]>("/api/ai-insights");
        return insights;
    }
}
