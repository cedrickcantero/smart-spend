import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase/schema';
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

    console.log("data", data);

    return data?.settings || { error: 'No settings found' };
  },

  async getUserSettingsByPath(userId: string, path: string[], supabase: SupabaseClient): Promise<any | { error: string }> {
    const result = await this.getUserSettings(userId, supabase);
    
    if ('error' in result) {
      return result;
    }
    
    let current: any = result;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key as keyof typeof current];
      } else {
        return { error: `Path ${path.join('.')} not found in user settings` };
      }
    }
    
    return current;
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
    // First check if settings exist for this user
    const { data: existingSettings, error: checkError } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // Not found error is OK
      console.error('Error checking user settings:', checkError);
      return { error: checkError.message };
    }

    if (existingSettings?.id) {
      // Update existing settings
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
      // Create new settings
      return this.createUserSettings(userId, settings, supabase);
    }
  },

  async updateUserSetting(
    userId: string, 
    path: string[], 
    value: any, 
    supabase: SupabaseClient
  ): Promise<DBUserSettings | { error: string }> {
    const settingsResult = await this.getUserSettings(userId, supabase);
    
    if ('error' in settingsResult) {
      return settingsResult;
    }

    // Create a deep copy of the settings
    const updatedSettings = JSON.parse(JSON.stringify(settingsResult));
    
    // Update the specific path
    let current = updatedSettings;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    // Set the value at the final path
    current[path[path.length - 1]] = value;
    
    // Update the settings
    return this.updateUserSettings(userId, updatedSettings, supabase);
  },
}; 