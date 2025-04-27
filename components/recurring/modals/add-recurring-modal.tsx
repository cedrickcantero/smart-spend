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
import { RecurringService } from "@/app/api/recurring/service"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { CategoriesService } from "@/app/api/categories/service"
import { DBCategory } from "@/types/supabase"
import { useAuth } from "@/app/contexts/AuthContext"
import { getCurrencySymbol, cn } from "@/lib/utils"
import { useUserSettings } from "@/app/contexts/UserSettingsContext"

interface AddRecurringModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fetchRecurringExpenses: () => void
}

const paymentMethods = [
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Mobile Payment", label: "Mobile Payment" },
  ]

export function AddRecurringModal({
  open,
  onOpenChange,
  fetchRecurringExpenses,
}: AddRecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [categories, setCategories] = useState<DBCategory[]>([])
  const { user } = useAuth()
  const [recurringData, setRecurringData] = useState({
    name: "",
    amount: "",
    category_id: "",
    due_day: "",
    frequency: "monthly",
    next_due_date: new Date(),
    payment_method: paymentMethods[0].value,
    is_automatic: false,
  })

  const { userSettings } = useUserSettings()
  const userCurrency = userSettings?.preferences?.currency || "USD"

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
    setRecurringData({
      ...recurringData,
      [field]: value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!recurringData.name || recurringData.amount === "" || !recurringData.frequency) {
        throw new Error("Please fill in all required fields")
      }

      if (recurringData.category_id && !recurringData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error("Please select a valid category")
      }

      await RecurringService.createRecurringExpense({
        ...recurringData,
        amount: parseFloat(recurringData.amount as string),
        due_day: recurringData.due_day ? parseInt(recurringData.due_day) : null,
        user_id: user?.id || "",
        next_due_date: recurringData.next_due_date.toISOString(),
      })
      toast({
        title: "Success",
        description: "Recurring expense created successfully",
        variant: "success",
      })
      setRecurringData({
        name: "",
        amount: "",
        category_id: "",
        due_day: "",
        frequency: "monthly",
        next_due_date: new Date(),
        payment_method: "",
        is_automatic: false,
      })
      onOpenChange(false)
      fetchRecurringExpenses()
    } catch (error) {
      const err = error as { message?: string };

      console.error("Error creating recurring expense:", error)
      toast({
        title: "Error",
        description: err.message || "Failed to create recurring expense",
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
          <DialogTitle>Add Recurring Expense</DialogTitle>
          <DialogDescription>
            Create a new recurring expense or subscription
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
                value={recurringData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
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
                  value={recurringData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={recurringData.category_id}
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
              <Label htmlFor="frequency" className="text-right">
                Frequency*
              </Label>
              <Select
                value={recurringData.frequency}
                onValueChange={(value) => handleChange("frequency", value)}
                required
              >
                <SelectTrigger id="frequency" className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {recurringData.frequency === "monthly" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_day" className="text-right">
                  Due Day (1-31)
                </Label>
                <Input
                  id="due_day"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="15"
                  className="col-span-3"
                  value={recurringData.due_day}
                  onChange={(e) => handleChange("due_day", e.target.value)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="next_due_date" className="text-right">
                Next Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !recurringData.next_due_date && "text-muted-foreground")}
                    id="next_due_date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurringData.next_due_date ? (
                      format(recurringData.next_due_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={recurringData.next_due_date}
                    onSelect={(date) => handleChange("next_due_date", date)}
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
                value={recurringData.payment_method}
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
              <div className="text-right">Auto Payment</div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="is_automatic"
                  checked={recurringData.is_automatic}
                  onCheckedChange={(checked) => 
                    handleChange("is_automatic", checked === true)
                  }
                />
                <Label htmlFor="is_automatic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Automatic Payment
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


