import { api } from "@/lib/services/api-service";
import { DashboardData } from "@/lib/services/dashboard-service";


export const DashboardService = {
    getDashboardData: async (): Promise<DashboardData> => {
        try {
            const response = await api.get<DashboardData>("/api/dashboard");
            return response;
        } catch (error) {
            throw error;
        }
    }
}