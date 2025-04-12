"use client"

import { useState, useEffect } from "react"
import { Save, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

interface PreferencesData {
  preferences: {
    currency: string;
    dateFormat: string;
    language: string;
    theme: string;
    accentColor: string;
    compactMode: boolean;
    animations: boolean;
  };
  dashboard: {
    showRecentTransactions: boolean;
    showBudgetProgress: boolean;
    showAIInsights: boolean;
    showUpcomingBills: boolean;
  };
}

const defaultPreferencesData: PreferencesData = {
  preferences: {
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    language: "en",
    theme: "system",
    accentColor: "blue",
    compactMode: false,
    animations: true
  },
  dashboard: {
    showRecentTransactions: true,
    showBudgetProgress: true,
    showAIInsights: true,
    showUpcomingBills: true
  }
};

export function PreferencesSettings() {
  const { userSettings, updateUserSettings } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [preferencesData, setPreferencesData] = useState<PreferencesData>(defaultPreferencesData)
  const { theme: currentTheme, setTheme } = useTheme()

  
  useEffect(() => {
    if (userSettings) {
      const settings = userSettings as Record<string, any>;
      
      const storedTheme = settings.preferences?.theme;
      
      setPreferencesData({
        preferences: {
          currency: settings.preferences?.currency || defaultPreferencesData.preferences.currency,
          dateFormat: settings.preferences?.dateFormat || defaultPreferencesData.preferences.dateFormat,
          language: settings.preferences?.language || defaultPreferencesData.preferences.language,
          theme: storedTheme || preferencesData.preferences.theme,
          accentColor: settings.preferences?.accentColor || defaultPreferencesData.preferences.accentColor,
          compactMode: Boolean(settings.preferences?.compactMode),
          animations: Boolean(settings.preferences?.animations ?? true)
        },
        dashboard: {
          showRecentTransactions: Boolean(settings.dashboard?.showRecentTransactions ?? true),
          showBudgetProgress: Boolean(settings.dashboard?.showBudgetProgress ?? true),
          showAIInsights: Boolean(settings.dashboard?.showAIInsights ?? true),
          showUpcomingBills: Boolean(settings.dashboard?.showUpcomingBills ?? true)
        }
      });
    }
  }, [userSettings]);
  
  useEffect(() => {
  }, [currentTheme]);

  useEffect(() => {
    if (currentTheme && !preferencesData.preferences.theme) {
      setPreferencesData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          theme: currentTheme
        }
      }));
    }
  }, [currentTheme]);

  useEffect(() => {
    const themeValue = preferencesData.preferences.theme;
    if (themeValue && themeValue !== currentTheme) {
      console.log("Applying theme:", themeValue);
      setTheme(themeValue);
    }
  }, [preferencesData.preferences.theme, setTheme]);

  const handlePreferencesUpdate = async () => {
    setIsLoading(true);
    try {
      if (updateUserSettings) {
        const prefResult = await updateUserSettings(
          ['preferences'],
          preferencesData.preferences
        );
        
        if (!prefResult.success) {
          throw new Error("Failed to update preferences");
        }
        
        const dashResult = await updateUserSettings(
          ['dashboard'],
          preferencesData.dashboard
        );
        
        if (!dashResult.success) {
          throw new Error("Failed to update dashboard preferences");
        }
        
        toast({
          title: "Preferences updated",
          description: "Your preferences have been saved successfully.",
          variant: "success",
        });
      } else {
        throw new Error("Update function not available");
      }
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message || "There was an error updating your preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = <K extends keyof PreferencesData["preferences"]>(
    field: K, 
    value: PreferencesData["preferences"][K]
  ) => {
    setPreferencesData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const updateDashboard = <K extends keyof PreferencesData["dashboard"]>(
    field: K, 
    value: PreferencesData["dashboard"][K]
  ) => {
    setPreferencesData(prev => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        [field]: value
      }
    }));
  };

  const handleThemeChange = (newTheme: string) => {
    updatePreference('theme', newTheme);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
          <CardDescription>
            Customize how dates, currencies, and other regional settings are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={preferencesData.preferences.currency} 
              onValueChange={(value) => updatePreference('currency', value)}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                <SelectItem value="PHP">PHP - Philippine Peso (₱)</SelectItem>
                <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select 
              value={preferencesData.preferences.dateFormat} 
              onValueChange={(value) => updatePreference('dateFormat', value)}
            >
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={preferencesData.preferences.language} 
              onValueChange={(value) => updatePreference('language', value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handlePreferencesUpdate} disabled={isLoading}>
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={preferencesData.preferences.theme} 
              onValueChange={handleThemeChange}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <Select 
              value={preferencesData.preferences.accentColor} 
              onValueChange={(value) => updatePreference('accentColor', value)}
            >
              <SelectTrigger id="accent-color">
                <SelectValue placeholder="Select accent color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing and padding throughout the interface</p>
            </div>
            <Switch 
              id="compact-mode" 
              checked={preferencesData.preferences.compactMode}
              onCheckedChange={(value) => updatePreference('compactMode', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">Animations</Label>
              <p className="text-sm text-muted-foreground">Enable animations and transitions</p>
            </div>
            <Switch 
              id="animations" 
              checked={preferencesData.preferences.animations}
              onCheckedChange={(value) => updatePreference('animations', value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handlePreferencesUpdate} disabled={isLoading}>
            <Palette className="h-4 w-4" />
            Apply Theme
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Preferences</CardTitle>
          <CardDescription>Customize what appears on your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Recent Transactions</Label>
              <p className="text-sm text-muted-foreground">
                Display your most recent transactions on the dashboard
              </p>
            </div>
            <Switch 
              checked={preferencesData.dashboard.showRecentTransactions}
              onCheckedChange={(value) => updateDashboard('showRecentTransactions', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Budget Progress</Label>
              <p className="text-sm text-muted-foreground">Display your budget progress on the dashboard</p>
            </div>
            <Switch 
              checked={preferencesData.dashboard.showBudgetProgress}
              onCheckedChange={(value) => updateDashboard('showBudgetProgress', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show AI Insights</Label>
              <p className="text-sm text-muted-foreground">Display AI-powered insights on the dashboard</p>
            </div>
            <Switch 
              checked={preferencesData.dashboard.showAIInsights}
              onCheckedChange={(value) => updateDashboard('showAIInsights', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Upcoming Bills</Label>
              <p className="text-sm text-muted-foreground">Display upcoming bills on the dashboard</p>
            </div>
            <Switch 
              checked={preferencesData.dashboard.showUpcomingBills}
              onCheckedChange={(value) => updateDashboard('showUpcomingBills', value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto" onClick={handlePreferencesUpdate} disabled={isLoading}>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 