"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Bell, CreditCard, Download, Globe, Lock, LogOut, Mail, Palette, Save, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currency, setCurrency] = useState("USD")
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY")
  const [theme, setTheme] = useState("system")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [unusualActivity, setUnusualActivity] = useState(true)

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })

    setIsLoading(false)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="payment" className="gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and how it appears on your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar_url || "/placeholder.svg?height=96&width=96"} />
                      <AvatarFallback className="text-lg">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us a little about yourself"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="gap-1">
                    {isLoading && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>Download a copy of your data from ExpenseTracker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Complete Data Export</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all your expense data, categories, and settings
                    </p>
                  </div>
                  <Button variant="outline" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Expense History</h3>
                    <p className="text-sm text-muted-foreground">Download only your expense transactions</p>
                  </div>
                  <Button variant="outline" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 border-destructive/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all your data</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Log Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                  <Button variant="outline" className="gap-1" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
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
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
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
                <Select defaultValue="en">
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
              <Button className="ml-auto gap-1">
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
                <Select value={theme} onValueChange={setTheme}>
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
                <Select defaultValue="blue">
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
                <Switch id="compact-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable animations and transitions</p>
                </div>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto gap-1">
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
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Budget Progress</Label>
                  <p className="text-sm text-muted-foreground">Display your budget progress on the dashboard</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show AI Insights</Label>
                  <p className="text-sm text-muted-foreground">Display AI-powered insights on the dashboard</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Upcoming Bills</Label>
                  <p className="text-sm text-muted-foreground">Display upcoming bills on the dashboard</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
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
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
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
                  <Switch id="weekly-reports" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-alerts">Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you're approaching budget limits</p>
                  </div>
                  <Switch id="budget-alerts" checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="unusual-activity">Unusual Activity</Label>
                    <p className="text-sm text-muted-foreground">Get notified about unusual spending patterns</p>
                  </div>
                  <Switch id="unusual-activity" checked={unusualActivity} onCheckedChange={setUnusualActivity} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="bill-reminders">Bill Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded before bills are due</p>
                  </div>
                  <Switch id="bill-reminders" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto gap-1">
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
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tips & Tutorials</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails with tips and tutorials on using the app
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about product updates and new features</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto gap-1">
                <Mail className="h-4 w-4" />
                Update Email Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Visa ending in 4242</h3>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Button className="gap-1">
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your billing address and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="billing-name">Name</Label>
                <Input id="billing-name" defaultValue="John Doe" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billing-address">Address</Label>
                <Input id="billing-address" defaultValue="123 Main St" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="billing-city">City</Label>
                  <Input id="billing-city" defaultValue="San Francisco" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="billing-state">State</Label>
                  <Input id="billing-state" defaultValue="CA" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="billing-zip">ZIP Code</Label>
                  <Input id="billing-zip" defaultValue="94103" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="billing-country">Country</Label>
                  <Select defaultValue="US">
                    <SelectTrigger id="billing-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Billing Information</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan and billing cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">Basic expense tracking features</p>
                  </div>
                  <Badge>Current Plan</Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced features, AI insights, and unlimited expense tracking
                    </p>
                    <p className="text-sm font-medium mt-1">$9.99/month</p>
                  </div>
                  <Button>Upgrade</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
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
              <Button className="ml-auto gap-1">
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
                <Switch />
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
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to analyze your spending patterns for personalized insights
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button variant="outline" className="w-full">
                Download My Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
