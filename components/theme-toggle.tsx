"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { userSettings } = useAuth()
  
  // Get theme from user preferences when component mounts
  useEffect(() => {
    if (userSettings?.settings) {
      const settings = userSettings.settings as Record<string, any>;
      const userTheme = settings.preferences?.theme;
      
      // If user has a theme preference and it doesn't match current theme, update it
      if (userTheme && userTheme !== theme) {
        setTheme(userTheme);
      }
    }
  }, [userSettings, theme, setTheme]);
  
  // Display the appropriate icon for the current theme
  const getThemeIcon = () => {
    switch(theme) {
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      default:
        return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  // Get theme name for the tooltip
  const getThemeName = () => {
    switch(theme) {
      case 'dark':
        return 'Dark Theme';
      case 'light':
        return 'Light Theme';
      default:
        return 'System Theme';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {getThemeIcon()}
            <span className="sr-only">Current theme: {getThemeName()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Current theme: {getThemeName()}</p>
          <p className="text-xs text-muted-foreground">Change in preferences</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 