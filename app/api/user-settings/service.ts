import { api } from "@/lib/services/api-service";
import { DBUserSettings } from "@/types/supabase";

export const UserSettingsService = {
  async getUserSettings(): Promise<DBUserSettings | null> {
    try {
      const response = await api.get<DBUserSettings>('/api/user-settings');
      return response;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  },

  async getUserSettingByPath(path: string | string[]): Promise<DBUserSettings | null> {
    try {
      const pathParam = Array.isArray(path) ? path.join('.') : path;
      const response = await api.get<DBUserSettings>(`/api/user-settings?path=${encodeURIComponent(pathParam)}`);
      return response;
    } catch (error) {
      console.error('Error fetching user setting:', error);
      return null;
    }
  },

  async updateUserSettings(settings: DBUserSettings): Promise<DBUserSettings | null> {
    try {
      const response = await api.post<DBUserSettings>('/api/user-settings', { settings });
      return response;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  },

  async updateUserSetting(path: string | string[], value: unknown): Promise<{ success: boolean; error?: unknown; data?: DBUserSettings }> {
    try {
      const pathArray = Array.isArray(path) ? path : path.split('.');
      const response = await api.patch<DBUserSettings>('/api/user-settings', { path: pathArray, value });
      return { 
        success: !!response, 
        data: response 
      };
    } catch (error) {
      console.error('Error updating user setting:', error);
      return { success: false, error };
    }
  },
};
