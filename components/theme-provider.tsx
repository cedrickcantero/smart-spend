'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme
} from 'next-themes'
import { useAuth } from '@/lib/auth-context'
import { UserSettings } from '@/types/userSettings'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  )
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()
  const { userSettings } = useAuth()
  
  React.useEffect(() => {
    if (userSettings) {
      const settings = userSettings as unknown as UserSettings
      if (settings.preferences?.theme) {
        setTheme(settings.preferences.theme)
      }
    }
  }, [userSettings, setTheme])
  
  return <>{children}</>
}
