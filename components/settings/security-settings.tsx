"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
// import { UserSettings } from "@/types/userSettings"
import { supabase } from "@/lib/supabase/client"

// interface SecuritySettingsData {
//   twoFactorEnabled: boolean;
//   dataCollection: boolean;
//   aiFeatures: boolean;
// }

// const defaultSecuritySettings: SecuritySettingsData = {
//   twoFactorEnabled: false,
//   dataCollection: true,
//   aiFeatures: true
// };

export function SecuritySettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  // const [securityData, setSecurityData] = useState<SecuritySettingsData>(defaultSecuritySettings)
  const [passwordForm, setPasswordForm] = useState<{
    newPassword: string;
    confirmPassword: string;
    currentPassword: string;
  }>({
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  })

  // useEffect(() => {
  //   if (userSettings) {
  //     const settings = userSettings as unknown as UserSettings;
  //     if (settings.security) {
  //       setSecurityData({
  //         twoFactorEnabled: Boolean(settings.security.twoFactorEnabled),
  //         dataCollection: Boolean(settings.security.dataCollection ?? true),
  //         aiFeatures: Boolean(settings.security.aiFeatures ?? true)
  //       });
  //     }
  //   }
  // }, [userSettings]);

  const verifyCurrentPassword = async (email: string, currentPassword: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
  
    if (error) {
      return { success: false, message: "Invalid current password." };
    }
  
    return { success: true, session: data.session };
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error }
  }

  const handlePasswordUpdate = async () => {
    setIsLoading(true);
    try {

      if(passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: "Error updating password",
          description: "New password and confirm password do not match.",
          variant: "destructive",
        });
        return;
      }

      if(passwordForm.currentPassword === passwordForm.newPassword) {
        toast({
          title: "Error updating password",
          description: "New password and current password cannot be the same.",
          variant: "destructive",
        });
        return;
      }

      const { success, message } = await verifyCurrentPassword(user?.email || '', passwordForm.currentPassword)
      if (!success) throw new Error(message || "Invalid current password.")

      const { error: updateError } = await updatePassword(passwordForm.newPassword)
      if (updateError) throw updateError

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
        variant: "success",
      });
      

    } catch (error) {
      const err = error as { message?: string };
      toast({
        title: "Error updating password",
        description: err.message || "There was an error updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSecurityUpdate = async () => {
  //   setIsLoading(true);
  //   try {
  //     if (updateUserSettings) {
  //       const { success, error } = await updateUserSettings(
  //         ['security'],
  //         securityData
  //       );
        
  //       if (!success) throw error;
        
  //       toast({
  //         title: "Security settings updated",
  //         description: "Your security preferences have been saved successfully.",
  //         variant: "success",
  //       });
  //     } else {
  //       throw new Error("Update function not available");
  //     }
  //   } catch (error) {
  //     const err = error as { message?: string };

  //     toast({
  //       title: "Error updating security settings",
  //       description: err.message || "There was an error updating your security settings.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
            <Input id="current-password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handlePasswordUpdate} disabled={isLoading}>
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </CardFooter>
      </Card>

      {/* <Card>
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
      </Card> */}

      {/* <Card>
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
      </Card> */}

      {/* <Card>
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
      </Card> */}
    </div>
  )
} 