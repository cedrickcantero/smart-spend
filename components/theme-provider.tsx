'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme
} from 'next-themes'
import { useUserSettings } from '@/app/contexts/UserSettingsContext'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  )
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()
  const { userSettings } = useUserSettings()
  
  React.useEffect(() => {
    if (userSettings?.preferences?.theme) {
      setTheme(userSettings.preferences.theme)
    }
  }, [userSettings, setTheme])
  
  return <>{children}</>
}
