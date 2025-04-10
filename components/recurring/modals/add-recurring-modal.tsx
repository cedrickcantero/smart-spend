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
  const [recurringData, setRecurringData] = useState({
    name: "",
    amount: 0,
    category_id: "",
    due_day: "",
    frequency: "monthly",
    next_due_date: new Date(),
    payment_method: paymentMethods[0].value,
    is_automatic: false,
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

  const handleChange = (field: string, value: any) => {
    setRecurringData({
      ...recurringData,
      [field]: value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Validate form
      if (!recurringData.name || !recurringData.amount || !recurringData.frequency) {
        throw new Error("Please fill in all required fields")
      }

      // Ensure category_id is a valid UUID if provided
      if (recurringData.category_id && !recurringData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error("Please select a valid category")
      }

      await RecurringService.createRecurringExpense({
        ...recurringData,
        due_day: recurringData.due_day ? parseInt(recurringData.due_day) : null,
      })
      toast({
        title: "Success",
        description: "Recurring expense created successfully",
      })
      setRecurringData({
        name: "",
        amount: 0,
        category_id: "",
        due_day: "",
        frequency: "monthly",
        next_due_date: new Date(),
        payment_method: "",
        is_automatic: false,
      })
      onOpenChange(false)
      fetchRecurringExpenses()
    } catch (error: any) {
      console.error("Error creating recurring expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create recurring expense",
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
          <DialogTitle>Add Recurring Expense</DialogTitle>
          <DialogDescription>
            Create a new recurring expense or subscription
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="Netflix" 
              value={recurringData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="19.99"
              value={recurringData.amount}
              onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={recurringData.category_id}
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
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={recurringData.frequency}
              onValueChange={(value) => handleChange("frequency", value)}
            >
              <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="due_day">Due Day (1-31)</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                placeholder="15"
                value={recurringData.due_day}
                onChange={(e) => handleChange("due_day", e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="next_due_date">Next Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full pl-3 text-left font-normal"
                  id="next_due_date"
                >
                  {recurringData.next_due_date ? (
                    format(recurringData.next_due_date, "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
          
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={recurringData.payment_method}
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
          
          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox
              id="is_automatic"
              checked={recurringData.is_automatic}
              onCheckedChange={(checked) => 
                handleChange("is_automatic", checked === true)
              }
            />
            <Label htmlFor="is_automatic" className="cursor-pointer">
              Automatic Payment
            </Label>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


