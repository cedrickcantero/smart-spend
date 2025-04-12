"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { supabase } from "@/lib/supabase/client"
import type {
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js"
import { UserSettingsService } from "@/app/api/user-settings/service"
import { DBUserSettings } from "@/types/supabase"

type User = SupabaseUser

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  userSettings: DBUserSettings
  updateUserSettings: (pathOrSettings: string[] | DBUserSettings, value?: unknown) => Promise<{ success: boolean; error?: unknown }>
  updateUserProfile: (firstName: string, lastName: string, bio?: string) => Promise<{ success: boolean; error?: unknown }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Initialize with empty object that follows DBUserSettings structure
  const [userSettings, setUserSettings] = useState<DBUserSettings>({
    id: '',
    user_id: null,
    settings: {},
    created_at: null,
    updated_at: null
  })

  const fetchUserSettings = useCallback(async () => {
    if (user) {
      try {
        const response = await UserSettingsService.getUserSettings();
        
        if (response) {
          setUserSettings(response);
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUser(data.session.user)
        setSession(data.session)
      }
      setIsLoading(false)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setSession(session ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchUserSettings();
  }, [user, fetchUserSettings]);

  const updateUserSettings = async (
    pathOrSettings: string[] | DBUserSettings,
    value?: unknown
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let result;
      
      if (Array.isArray(pathOrSettings)) {
        // Handle paths and ensure no 'settings.' prefix
        const correctedPath = pathOrSettings[0] === 'settings' 
          ? pathOrSettings.slice(1) 
          : pathOrSettings;
        
        result = await UserSettingsService.updateUserSetting(correctedPath, value as unknown as DBUserSettings);
      } else {
        result = await UserSettingsService.updateUserSettings(pathOrSettings);
      }

      if (result) {
        // Refresh user settings after update
        fetchUserSettings();
        return { success: true };
      }
      
      return { success: false, error: "Failed to update settings" };
    } catch (error) {
      console.error("Error updating user settings:", error);
      return { success: false, error: error as string };
    }
  };

  const updateUserProfile = async (
    firstName: string, 
    lastName: string, 
    bio?: string
  ): Promise<{ success: boolean; error?: unknown }> => {
    try {
      // Update user metadata
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}` // Keep full name for backward compatibility
        }
      });

      if (userUpdateError) throw userUpdateError;

      // Update user settings if bio is provided
      if (bio !== undefined) {
        // Use path-based update for profile.bio
        const { success, error } = await updateUserSettings(['profile', 'bio'], bio);
        if (!success) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Split the full name into first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name, // Keep original full name for backward compatibility
          first_name: firstName,
          last_name: lastName
        },
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      // Reset user settings on sign out
      setUserSettings({
        id: '',
        user_id: null,
        settings: {},
        created_at: null,
        updated_at: null
      })
    }
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        userSettings,
        updateUserSettings,
        updateUserProfile,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
