"use client"

import { useState, useEffect } from "react"
import { Lock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface SecuritySettingsData {
  twoFactorEnabled: boolean;
  dataCollection: boolean;
  aiFeatures: boolean;
}

const defaultSecuritySettings: SecuritySettingsData = {
  twoFactorEnabled: false,
  dataCollection: true,
  aiFeatures: true
};

export function SecuritySettings() {
  const { userSettings, updateUserSettings } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [securityData, setSecurityData] = useState<SecuritySettingsData>(defaultSecuritySettings)

  useEffect(() => {
    if (userSettings?.settings) {
      const settings = userSettings.settings as Record<string, any>;
      if (settings.security) {
        setSecurityData({
          twoFactorEnabled: Boolean(settings.security.twoFactorEnabled),
          dataCollection: Boolean(settings.security.dataCollection ?? true),
          aiFeatures: Boolean(settings.security.aiFeatures ?? true)
        });
      }
    }
  }, [userSettings]);

  const handleSecurityUpdate = async () => {
    setIsLoading(true);
    try {
      if (updateUserSettings) {
        const { success, error } = await updateUserSettings(
          ['security'],
          securityData
        );
        
        if (!success) throw error;
        
        toast({
          title: "Security settings updated",
          description: "Your security preferences have been saved successfully.",
        });
      } else {
        throw new Error("Update function not available");
      }
    } catch (error: any) {
      toast({
        title: "Error updating security settings",
        description: error.message || "There was an error updating your security settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password and manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handleSecurityUpdate} disabled={isLoading}>
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
            </div>
            <Switch 
              checked={securityData.twoFactorEnabled} 
              onCheckedChange={(value) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: value }))}
            />
          </div>

          <Button variant="outline" className="w-full">
            Set Up Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Manage your active sessions and devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Current Session</h3>
                <p className="text-sm text-muted-foreground">Chrome on Windows • San Francisco, CA • Active now</p>
              </div>
              <Badge>Current</Badge>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Safari on iPhone</h3>
                <p className="text-sm text-muted-foreground">San Francisco, CA • Last active 2 hours ago</p>
              </div>
              <Button variant="outline" size="sm">
                Log Out
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
          >
            Log Out of All Devices
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Manage your privacy settings and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Collection</Label>
              <p className="text-sm text-muted-foreground">
                Allow us to collect anonymous usage data to improve the app
              </p>
            </div>
            <Switch 
              checked={securityData.dataCollection} 
              onCheckedChange={(value) => setSecurityData(prev => ({ ...prev, dataCollection: value }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Features</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to analyze your spending patterns for personalized insights
              </p>
            </div>
            <Switch 
              checked={securityData.aiFeatures} 
              onCheckedChange={(value) => setSecurityData(prev => ({ ...prev, aiFeatures: value }))}
            />
          </div>

          <Button variant="outline" className="w-full">
            Download My Data
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handleSecurityUpdate} disabled={isLoading}>
            <Save className="h-4 w-4" />
            Save Privacy Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 