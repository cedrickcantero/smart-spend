"use client"

import { useState, useEffect } from "react"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { UserSettings } from "@/types/userSettings"
import { useUserSettings } from "@/app/contexts/UserSettingsContext"
interface PaymentSettingsData {
  paymentMethods: PaymentMethod[];
  billingAddress: BillingAddress;
  subscription: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface BillingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const defaultPaymentSettings: PaymentSettingsData = {
  paymentMethods: [],
  billingAddress: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  },
  subscription: "free"
};

export function PaymentSettings() {
  const { userSettings, updateUserSettings } = useUserSettings()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentSettingsData>(defaultPaymentSettings)
  
  useEffect(() => {
    if (userSettings) {
      const settings = userSettings as unknown as UserSettings;
      if (settings.payment) {
        setPaymentData({
          paymentMethods: settings.payment.paymentMethods || [],
          billingAddress: {
            address: settings.payment.billingAddress?.address || "",
            city: settings.payment.billingAddress?.city || "",
            state: settings.payment.billingAddress?.state || "",
            zipCode: settings.payment.billingAddress?.zipCode || "",
            country: settings.payment.billingAddress?.country || "US"
          },
          subscription: settings.payment.subscription || "free"
        });
      }
    }
  }, [userSettings]);

  const handleBillingUpdate = async () => {
    setIsLoading(true);
    try {
      if (updateUserSettings) {
        const { success, error } = await updateUserSettings(
          ['payment'],
          paymentData
        );
        
        if (!success) throw error;
        
        toast({
          title: "Billing information updated",
          description: "Your billing information has been saved successfully.",
        });
      } else {
        throw new Error("Update function not available");
      }
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error updating billing information",
        description: err.message || "There was an error updating your billing information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBillingField = (field: keyof BillingAddress, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-4">
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
            <Label htmlFor="billing-address">Address</Label>
            <Input 
              id="billing-address" 
              value={paymentData.billingAddress.address}
              onChange={(e) => updateBillingField('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="billing-city">City</Label>
              <Input 
                id="billing-city" 
                value={paymentData.billingAddress.city}
                onChange={(e) => updateBillingField('city', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing-state">State</Label>
              <Input 
                id="billing-state" 
                value={paymentData.billingAddress.state}
                onChange={(e) => updateBillingField('state', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="billing-zip">ZIP Code</Label>
              <Input 
                id="billing-zip" 
                value={paymentData.billingAddress.zipCode}
                onChange={(e) => updateBillingField('zipCode', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing-country">Country</Label>
              <Select 
                value={paymentData.billingAddress.country}
                onValueChange={(value) => updateBillingField('country', value)}
              >
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
          <Button className="ml-auto" onClick={handleBillingUpdate} disabled={isLoading}>
            Save Billing Information
          </Button>
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
    </div>
  )
} 