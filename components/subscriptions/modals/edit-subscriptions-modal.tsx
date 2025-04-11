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

interface EditSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: DBSubscription
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

export function EditSubscriptionModal({
  open,
  onOpenChange,
  subscription,
  fetchSubscriptions,
}: EditSubscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [subscriptionData, setSubscriptionData] = useState({
    id: subscription.id,
    name: subscription.name,
    description: subscription.description || "",
    amount: subscription.amount,
    billing_cycle: subscription.billing_cycle,
    next_billing_date: new Date(subscription.next_billing_date),
    category_id: subscription.category_id || "",
    is_active: subscription.is_active,
    payment_method: subscription.payment_method || paymentMethods[0].value,
    website: subscription.website || "",
    notes: subscription.notes || "",
  })

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

  useEffect(() => {
    setSubscriptionData({
      id: subscription.id,
      name: subscription.name,
      description: subscription.description || "",
      amount: subscription.amount,
      billing_cycle: subscription.billing_cycle,
      next_billing_date: new Date(subscription.next_billing_date),
      category_id: subscription.category_id || "",
      is_active: subscription.is_active,
      payment_method: subscription.payment_method || paymentMethods[0].value,
      website: subscription.website || "",
      notes: subscription.notes || "",
    })
  }, [subscription])

  const handleChange = (field: string, value: any) => {
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

      await SubscriptionsService.updateSubscription({
        id: subscriptionData.id,
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
        description: "Subscription updated successfully",
      })
      setSubscriptionData({
        id: "",
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
    } catch (error: any) {
      console.error("Error creating subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Edit the subscription
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="Netflix" 
              value={subscriptionData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description"
              placeholder="Streaming service" 
              value={subscriptionData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="19.99"
              value={subscriptionData.amount}
              onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={subscriptionData.category_id}
              onValueChange={(value) => handleChange("category_id", value)}
            >
              <SelectTrigger>
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
          
          <div className="space-y-2">
            <Label htmlFor="billing_cycle">Billing Cycle</Label>
            <Select
              value={subscriptionData.billing_cycle}
              onValueChange={(value) => handleChange("billing_cycle", value)}
            >
              <SelectTrigger>
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
          
          <div className="space-y-2">
            <Label htmlFor="next_billing_date">Next Billing Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full pl-3 text-left font-normal"
                  id="next_billing_date"
                >
                  {subscriptionData.next_billing_date ? (
                    format(subscriptionData.next_billing_date, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
          
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={subscriptionData.payment_method}
              onValueChange={(value) => handleChange("payment_method", value)}
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website"
              type="url"
              placeholder="https://example.com" 
              value={subscriptionData.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes"
              placeholder="Additional notes" 
              value={subscriptionData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox
              id="is_active"
              checked={subscriptionData.is_active}
              onCheckedChange={(checked) => 
                handleChange("is_active", checked === true)
              }
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active Subscription
            </Label>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


