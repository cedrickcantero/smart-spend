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
import { useUserSettings } from "@/app/contexts/UserSettingsContext"
import { getCurrencySymbol, cn } from "@/lib/utils"

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
  recurring,
  fetchRecurringExpenses,
}: EditRecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { userSettings } = useUserSettings()
  const userCurrency = userSettings?.preferences?.currency || "USD"
  
  const [recurringData, setRecurringData] = useState({
    id: recurring.id,
    name: recurring.name,
    amount: recurring.amount,
    category_id: recurring.category_id,
    due_day: recurring.due_day,
    frequency: recurring.frequency,
    next_due_date: new Date(recurring.next_due_date),
    payment_method: recurring.payment_method,
    is_automatic: false,
  })

  useEffect(() => {
    if (recurring) {
      setRecurringData({
        id: recurring.id,
        name: recurring.name,
        amount: recurring.amount,
        category_id: recurring.category_id || "",
        due_day: recurring.due_day,
        frequency: recurring.frequency,
        next_due_date: new Date(recurring.next_due_date),
        payment_method: recurring.payment_method,
        is_automatic: recurring.is_automatic || false,
      })
    }
  }, [recurring, open])

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
      await RecurringService.updateRecurringExpense({
        ...recurringData,
        next_due_date: format(recurringData.next_due_date, 'yyyy-MM-dd'),
        created_at: recurring.created_at,
        updated_at: new Date().toISOString(),
        user_id: recurring.user_id
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
        next_due_date: new Date(recurring.next_due_date),
        payment_method: recurring.payment_method,
        is_automatic: recurring.is_automatic || false,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Recurring Expense</DialogTitle>
          <DialogDescription>
            Edit your recurring expense
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
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency*
              </Label>
              <Select
                value={recurringData.frequency}
                onValueChange={(value) => handleChange("frequency", value)}
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
                  value={recurringData.due_day ?? ''}
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
              <Input
                id="payment_method"
                placeholder="Credit Card"
                className="col-span-3"
                value={recurringData.payment_method ?? ''}
                onChange={(e) => handleChange("payment_method", e.target.value)}
              />
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
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


