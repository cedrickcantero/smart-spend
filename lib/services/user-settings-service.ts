import { SupabaseClient } from '@supabase/supabase-js';
import { DBUserSettings } from '@/types/supabase/index';


export const UserSettingsService = {
  async getUserSettings(userId: string, supabase: SupabaseClient): Promise<DBUserSettings | { error: string }> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('settings')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
      return { error: error.message };
    }

    return data?.settings || { error: 'No settings found' };
  },

  async getUserSettingsByPath(userId: string, path: string[], supabase: SupabaseClient): Promise<DBUserSettings | { error: string }> {
    const result = await this.getUserSettings(userId, supabase);
    
    if ('error' in result) {
      return result;
    }
    
    let current: unknown = result;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key as keyof typeof current];
      } else {
        return { error: `Path ${path.join('.')} not found in user settings` };
      }
    }
    
    return current as DBUserSettings;
  },

  async createUserSettings(userId: string, settings: DBUserSettings, supabase: SupabaseClient): Promise<DBUserSettings | { error: string }> {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ 
        user_id: userId, 
        settings 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user settings:', error);
      return { error: error.message };
    }

    return data;
  },

  async updateUserSettings(userId: string, settings: DBUserSettings, supabase: SupabaseClient): Promise<DBUserSettings | { error: string }> {
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user settings:', checkError);
      return { error: checkError.message };
    }

    if (existingSettings?.id) {
      const { data, error } = await supabase
        .from('user_settings')
        .update({ 
          settings, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        return { error: error.message };
      }

      return data;
    } else {
      return this.createUserSettings(userId, settings, supabase);
    }
  },

  async updateUserSetting(
    userId: string, 
    path: string[], 
    value: DBUserSettings, 
    supabase: SupabaseClient
  ): Promise<DBUserSettings | { error: string }> {
    const settingsResult = await this.getUserSettings(userId, supabase);
    
    if ('error' in settingsResult) {
      return settingsResult;
    }

    const updatedSettings = JSON.parse(JSON.stringify(settingsResult));
    
    let current = updatedSettings;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    
    return this.updateUserSettings(userId, updatedSettings, supabase);
  },
}; 