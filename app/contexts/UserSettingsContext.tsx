"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { UserSettings } from "@/types/userSettings"
import { UserSettingsService } from "@/app/api/user-settings/service"
import { useToast } from "@/hooks/use-toast"
import { StorageService } from "@/app/api/storage/service"
import { supabase } from "@/lib/supabase/client"

interface UserSettingsContextType {
  userSettings: UserSettings
  loading: boolean
  error: string | null
  updateUserSettings: (pathOrSettings: string[] | Partial<UserSettings>, value?: unknown) => Promise<{ success: boolean; error?: unknown }>
  updateUserProfile: (firstName: string, lastName: string, bio?: string) => Promise<{ success: boolean; error?: unknown }>
  updateUserAvatar: (selectedFile: File) => Promise<{ success: boolean; error?: unknown }>
  refreshUserSettings: () => Promise<void>
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [userSettings, setUserSettings] = useState<UserSettings>({} as UserSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUserSettings = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await UserSettingsService.getUserSettings()
  
      if (response) {
        setUserSettings(response as unknown as UserSettings)

      }
    } catch (err) {
      console.error("Failed to fetch user settings:", err)
      setError("Failed to load user settings")
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    refreshUserSettings()
  }, [refreshUserSettings])

  const updateUserSettings = async (
    pathOrSettings: string[] | Partial<UserSettings>,
    value?: unknown
  ): Promise<{ success: boolean; error?: unknown }> => {
    try {
      let result;
      
      if (Array.isArray(pathOrSettings)) {
        result = await UserSettingsService.updateUserSetting(pathOrSettings, value as unknown)
      } else {
        return { success: false, error: "No existing settings to update" }
      }

      if (result) {
        await refreshUserSettings()
        return { success: true }
      }
      
      return { success: false, error: "Failed to update settings" }
    } catch (error) {
      console.error("Error in UserSettingsContext updateUserSettings:", error)
      return { success: false, error }
    }
  }

  const updateUserProfile = async (
    firstName: string, 
    lastName: string, 
    bio?: string
  ): Promise<{ success: boolean; error?: unknown }> => {
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`
        }
      });

      if (userUpdateError) throw userUpdateError;

      if (bio !== undefined) {
        const { success, error } = await updateUserSettings(['profile', 'bio'], bio);
        if (!success) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error };
    }
  };

  const updateUserAvatar = async (selectedFile: File): Promise<{ success: boolean; error?: unknown }> => {
    if (!selectedFile) return { success: false, error: "No file selected" };
    
    try {
      const response = await StorageService.uploadFile(selectedFile, user?.id ?? '');

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.url) {
        await updateUserSettings(['profile', 'avatar_url'], response.url);
        return { success: true };
      }
      
      return { success: false, error: "No URL returned from upload" };
    } catch (err) {
      console.error("Avatar update failed:", err);
      return { success: false, error: err };
    }
  };    

  const value = {
    userSettings,
    loading,
    error,
    updateUserSettings,
    updateUserProfile,
    updateUserAvatar,
    refreshUserSettings
  }

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  )
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext)
  if (context === undefined) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider")
  }
  return context
} 