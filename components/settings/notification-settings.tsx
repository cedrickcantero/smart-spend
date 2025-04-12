"use client"

import { useState, useEffect } from "react"
import { Bell, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettingsData {
  email: {
    productUpdates: boolean;
    marketingEmails: boolean;
    tipsAndTutorials: boolean;
  };
  notifications: {
    types: {
      budgetAlerts: boolean;
      billReminders: boolean;
      weeklyReports: boolean;
      unusualActivity: boolean;
    };
    channels: {
      pushNotifications: boolean;
      emailNotifications: boolean;
    };
  };
}

const defaultNotificationSettings: NotificationSettingsData = {
  email: {
    productUpdates: true,
    marketingEmails: false,
    tipsAndTutorials: true
  },
  notifications: {
    types: {
      budgetAlerts: true,
      billReminders: true,
      weeklyReports: true,
      unusualActivity: true
    },
    channels: {
      pushNotifications: true,
      emailNotifications: true
    }
  }
};

export function NotificationSettings() {
  const { userSettings, updateUserSettings } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notificationData, setNotificationData] = useState<NotificationSettingsData>(defaultNotificationSettings)
  
  useEffect(() => {
    if (userSettings && typeof userSettings === 'object' && userSettings.settings) {
      const settings = userSettings.settings as any;
      
      const newNotificationData: NotificationSettingsData = {
        email: {
          productUpdates: Boolean(settings.email?.productUpdates ?? true),
          marketingEmails: Boolean(settings.email?.marketingEmails ?? false),
          tipsAndTutorials: Boolean(settings.email?.tipsAndTutorials ?? true)
        },
        notifications: {
          types: {
            budgetAlerts: Boolean(settings.notifications?.types?.budgetAlerts ?? true),
            billReminders: Boolean(settings.notifications?.types?.billReminders ?? true),
            weeklyReports: Boolean(settings.notifications?.types?.weeklyReports ?? true),
            unusualActivity: Boolean(settings.notifications?.types?.unusualActivity ?? true)
          },
          channels: {
            pushNotifications: Boolean(settings.notifications?.channels?.pushNotifications ?? true),
            emailNotifications: Boolean(settings.notifications?.channels?.emailNotifications ?? true)
          }
        }
      };
      
      setNotificationData(newNotificationData);
    }
  }, [userSettings]);

  const handleNotificationsUpdate = async () => {
    setIsLoading(true);
    try {
      if (updateUserSettings) {
        const emailResult = await updateUserSettings(
          ['email'], 
          notificationData.email
        );
        
        if (!emailResult.success) {
          throw new Error("Failed to update email settings");
        }
        
        const notificationsResult = await updateUserSettings(
          ['notifications'], 
          notificationData.notifications
        );
        
        if (!notificationsResult.success) {
          throw new Error("Failed to update notification settings");
        }
        
        toast({
          title: "Notification settings updated",
          description: "Your notification preferences have been saved successfully.",
        });
      } else {
        throw new Error("Update function not available");
      }
    } catch (error: any) {
      toast({
        title: "Error updating notifications",
        description: error.message || "There was an error updating your notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to update nested state
  const updateChannelSetting = (field: keyof typeof notificationData.notifications.channels, value: boolean) => {
    setNotificationData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        channels: {
          ...prev.notifications.channels,
          [field]: value
        }
      }
    }));
  };

  const updateTypeSetting = (field: keyof typeof notificationData.notifications.types, value: boolean) => {
    setNotificationData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        types: {
          ...prev.notifications.types,
          [field]: value
        }
      }
    }));
  };

  const updateEmailSetting = (field: keyof typeof notificationData.email, value: boolean) => {
    setNotificationData(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notification Channels</h3>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationData.notifications.channels.emailNotifications}
                onCheckedChange={(value) => updateChannelSetting('emailNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={notificationData.notifications.channels.pushNotifications} 
                onCheckedChange={(value) => updateChannelSetting('pushNotifications', value)} 
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Notification Types</h3>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly spending reports and insights</p>
              </div>
              <Switch 
                id="weekly-reports" 
                checked={notificationData.notifications.types.weeklyReports} 
                onCheckedChange={(value) => updateTypeSetting('weeklyReports', value)} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-alerts">Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when you're approaching budget limits</p>
              </div>
              <Switch 
                id="budget-alerts" 
                checked={notificationData.notifications.types.budgetAlerts} 
                onCheckedChange={(value) => updateTypeSetting('budgetAlerts', value)} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="unusual-activity">Unusual Activity</Label>
                <p className="text-sm text-muted-foreground">Get notified about unusual spending patterns</p>
              </div>
              <Switch 
                id="unusual-activity" 
                checked={notificationData.notifications.types.unusualActivity} 
                onCheckedChange={(value) => updateTypeSetting('unusualActivity', value)} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bill-reminders">Bill Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded before bills are due</p>
              </div>
              <Switch 
                id="bill-reminders" 
                checked={notificationData.notifications.types.billReminders} 
                onCheckedChange={(value) => updateTypeSetting('billReminders', value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handleNotificationsUpdate} disabled={isLoading}>
            <Bell className="h-4 w-4" />
            Save Notification Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage your email subscription preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive emails about new features and promotions</p>
            </div>
            <Switch 
              checked={notificationData.email.marketingEmails} 
              onCheckedChange={(value) => updateEmailSetting('marketingEmails', value)} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tips & Tutorials</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails with tips and tutorials on using the app
              </p>
            </div>
            <Switch 
              checked={notificationData.email.tipsAndTutorials} 
              onCheckedChange={(value) => updateEmailSetting('tipsAndTutorials', value)} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Product Updates</Label>
              <p className="text-sm text-muted-foreground">Receive emails about product updates and new features</p>
            </div>
            <Switch 
              checked={notificationData.email.productUpdates} 
              onCheckedChange={(value) => updateEmailSetting('productUpdates', value)} 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto gap-1" onClick={handleNotificationsUpdate} disabled={isLoading}>
            <Mail className="h-4 w-4" />
            Update Email Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 