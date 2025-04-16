"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { CategoriesService } from "@/app/api/categories/service"
import { DBCategory, DBSubscription } from "@/types/supabase"
import { SubscriptionsService } from "@/app/api/subscriptions/service"
import { cn, getCurrencySymbol } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { UserSettings } from "@/types/userSettings"

interface AddSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptions: DBSubscription[]
  fetchSubscriptions: () => void
}

const paymentMethods = [
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Mobile Payment", label: "Mobile Payment" },
  ]

const billingCycles = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
]

export function AddSubscriptionModal({
  open,
  onOpenChange,
  fetchSubscriptions,
}: AddSubscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [categories, setCategories] = useState<DBCategory[]>([])
  const { userSettings: dbUserSettings } = useAuth()
  const userSettings = dbUserSettings as unknown as UserSettings
  const userCurrency = userSettings?.preferences?.currency || "USD"
  
  const [subscriptionData, setSubscriptionData] = useState({
    name: "",
    description: "",
    amount: 0,
    billing_cycle: "monthly",
    next_billing_date: new Date(),
    category_id: "",
    is_active: true,
    payment_method: paymentMethods[0].value,
    website: "",
    notes: "",
  })

  // Fetch categories when the modal opens
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await CategoriesService.getCategories()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      }
    }
    loadCategories()
  }, [toast])

  const handleChange = (field: string, value: unknown) => {
    setSubscriptionData({
      ...subscriptionData,
      [field]: value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!subscriptionData.name || !subscriptionData.amount || !subscriptionData.billing_cycle) {
        throw new Error("Please fill in all required fields")
      }

      if (subscriptionData.category_id && !subscriptionData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error("Please select a valid category")
      }

      await SubscriptionsService.createSubscription({
        name: subscriptionData.name,
        description: subscriptionData.description || null,
        amount: subscriptionData.amount,
        billing_cycle: subscriptionData.billing_cycle,
        next_billing_date: subscriptionData.next_billing_date.toISOString().split('T')[0],
        category_id: subscriptionData.category_id || null,
        is_active: subscriptionData.is_active,
        payment_method: subscriptionData.payment_method || null,
        website: subscriptionData.website || null,
        notes: subscriptionData.notes || null,
      })
      toast({
        title: "Success",
        description: "Subscription created successfully",
        variant: "success",
      })
      setSubscriptionData({
        name: "",
        description: "",
        amount: 0,
        billing_cycle: "monthly",
        next_billing_date: new Date(),
        category_id: "",
        is_active: true,
        payment_method: paymentMethods[0].value,
        website: "",
        notes: "",
      })
      onOpenChange(false)
      fetchSubscriptions()
    } catch (error) {
      const err = error as { message?: string };

      console.error("Error creating recurring expense:", error)
      toast({
        title: "Error",
        description: err.message || "Failed to create subscription",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Create a new subscription
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input 
                id="name"
                placeholder="Netflix" 
                className="col-span-3"
                value={subscriptionData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input 
                id="description"
                placeholder="Streaming service" 
                className="col-span-3"
                value={subscriptionData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount*
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground leading-none">{getCurrencySymbol(userCurrency)}</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="19.99"
                  className="pl-8"
                  value={subscriptionData.amount}
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={subscriptionData.category_id}
                onValueChange={(value) => handleChange("category_id", value)}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billing_cycle" className="text-right">
                Billing Cycle*
              </Label>
              <Select
                value={subscriptionData.billing_cycle}
                onValueChange={(value) => handleChange("billing_cycle", value)}
                required
              >
                <SelectTrigger id="billing_cycle" className="col-span-3">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="next_billing_date" className="text-right">
                Next Billing Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !subscriptionData.next_billing_date && "text-muted-foreground")}
                    id="next_billing_date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {subscriptionData.next_billing_date ? (
                      format(subscriptionData.next_billing_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={subscriptionData.next_billing_date}
                    onSelect={(date) => handleChange("next_billing_date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_method" className="text-right">
                Payment Method
              </Label>
              <Select
                value={subscriptionData.payment_method}
                onValueChange={(value) => handleChange("payment_method", value)}
              >
                <SelectTrigger id="payment_method" className="col-span-3">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>      
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input 
                id="website"
                type="url"
                placeholder="https://example.com" 
                className="col-span-3"
                value={subscriptionData.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input 
                id="notes"
                placeholder="Additional notes" 
                className="col-span-3"
                value={subscriptionData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">Status</div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={subscriptionData.is_active}
                  onCheckedChange={(checked) => 
                    handleChange("is_active", checked === true)
                  }
                />
                <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Active Subscription
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


