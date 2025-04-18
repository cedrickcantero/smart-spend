import { FinancialData } from "@/lib/services/ai-service";
import { api } from "@/lib/services/api-service";
import { UserSettings } from "@/types/userSettings";

export class AIInsightsService {
    getFinancialInsights = async (data: FinancialData, settings: UserSettings) => {
        const insights = await api.post("/api/ai-insights", { data, settings });
        return insights;
    }
}
