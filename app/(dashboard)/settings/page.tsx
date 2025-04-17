"use client"

import type React from "react"
import { Bell, CreditCard, Globe, Lock, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {ProfileSettings} from "@/components/settings/profile-settings"
import {PreferencesSettings} from "@/components/settings/preferences-settings"
import {NotificationSettings} from "@/components/settings/notification-settings"
import {PaymentSettings} from "@/components/settings/payment-settings"
import {SecuritySettings} from "@/components/settings/security-settings"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          {/* <TabsTrigger value="payment" className="gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger> */}
          <TabsTrigger value="security" className="gap-1">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <PreferencesSettings />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationSettings />
        </TabsContent>

        {/* <TabsContent value="payment" className="mt-4">
          <PaymentSettings />
        </TabsContent> */}

        <TabsContent value="security" className="mt-4">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
