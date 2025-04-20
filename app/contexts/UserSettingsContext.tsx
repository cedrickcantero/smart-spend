"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { UserSettings } from "@/types/userSettings"
import { DBUserSettings } from "@/types/supabase"
import { Json } from "@/types/supabase/schema"

interface UserSettingsContextType {
  userSettings: UserSettings
  updateUserSettings: (pathOrSettings: string[] | UserSettings, value?: unknown) => Promise<{ success: boolean; error?: unknown }>
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const { userSettings: dbUserSettings, updateUserSettings: updateDbUserSettings } = useAuth()
  
  // Cast from DBUserSettings to UserSettings
  const userSettings = dbUserSettings.settings as unknown as UserSettings

  // Wrapper for updateUserSettings that handles type casting
  const updateUserSettings = async (
    pathOrSettings: string[] | UserSettings,
    value?: unknown
  ): Promise<{ success: boolean; error?: unknown }> => {
    try {
      if (Array.isArray(pathOrSettings)) {
        // Path-based update, pass through to auth context
        return await updateDbUserSettings(pathOrSettings, value)
      } else {
        // Full settings object update
        // Cast UserSettings back to DBUserSettings format
        const settingsToUpdate: DBUserSettings = {
          ...dbUserSettings,
          settings: pathOrSettings as unknown as Json
        }
        return await updateDbUserSettings(settingsToUpdate)
      }
    } catch (error) {
      console.error("Error in UserSettingsContext updateUserSettings:", error)
      return { success: false, error }
    }
  }

  const value = {
    userSettings,
    updateUserSettings
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