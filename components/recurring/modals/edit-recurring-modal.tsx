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
import { DBRecurringBill } from "@/types/supabase"

interface EditRecurringModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  recurring: DBRecurringBill
  fetchRecurringExpenses: () => void
}

export function EditRecurringModal({
  open,
  onOpenChange,
  onSuccess,
  recurring,
  fetchRecurringExpenses,
}: EditRecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [recurringData, setRecurringData] = useState({
    id: recurring.id,
    name: recurring.name,
    amount: recurring.amount,
    category_id: recurring.category_id,
    due_day: recurring.due_day,
    frequency: recurring.frequency,
    next_due_date: recurring.next_due_date,
    payment_method: recurring.payment_method,
    is_automatic: false,
  })

  // Initialize form with recurring data when modal opens
  useEffect(() => {
    if (recurring) {
      setRecurringData({
        id: recurring.id,
        name: recurring.name,
        amount: recurring.amount,
        category_id: recurring.category_id || "",
        due_day: recurring.due_day?.toString() || "",
        frequency: recurring.frequency,
        next_due_date: new Date(recurring.next_due_date),
        payment_method: recurring.payment_method,
        is_automatic: recurring.is_automatic,
      })
    }
  }, [recurring, open])

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
      await RecurringService.updateRecurringExpense({
        ...recurringData,
        due_day: recurringData.due_day ? parseInt(recurringData.due_day) : null,
      })
      toast({
        title: "Success",
        description: "Recurring expense updated successfully",
      })

      setRecurringData({
        id: recurring.id,
        name: recurring.name,
        amount: recurring.amount,
        category_id: recurring.category_id,
        due_day: recurring.due_day,
        frequency: recurring.frequency,
        next_due_date: recurring.next_due_date,
        payment_method: recurring.payment_method,
        is_automatic: recurring.is_automatic,
      })
      onOpenChange(false)
      fetchRecurringExpenses()
    } catch (error) {
      console.error("Error updating recurring expense:", error)
      toast({
        title: "Error",
        description: "Failed to update recurring expense",
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
          <DialogTitle>Edit Recurring Expense</DialogTitle>
          <DialogDescription>
            Edit your recurring expense
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
            <Input
              id="payment_method"
              placeholder="Credit Card"
              value={recurringData.payment_method}
              onChange={(e) => handleChange("payment_method", e.target.value)}
            />
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
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


