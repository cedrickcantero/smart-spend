"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Mock categories
const expenseCategories = [
  { value: "food", label: "Food & Dining", icon: "🍔" },
  { value: "housing", label: "Housing", icon: "🏠" },
  { value: "transportation", label: "Transportation", icon: "🚗" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "health", label: "Health", icon: "💊" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "personal", label: "Personal", icon: "👤" },
  { value: "other", label: "Other", icon: "📦" },
]

// Mock payment methods
const paymentMethods = [
  { value: "credit", label: "Credit Card" },
  { value: "debit", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "mobile", label: "Mobile Payment" },
]

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [amount, setAmount] = useState("")
  const [merchant, setMerchant] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!amount || !merchant || !category) {
        throw new Error("Please fill in all required fields")
      }

      toast({
        title: "Expense added",
        description: `$${amount} expense to ${merchant} has been added successfully.`,
        variant: "success",
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount("")
    setMerchant("")
    setCategory("")
    setDate(new Date())
    setPaymentMethod("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Enter the details of your expense.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount*
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchant" className="text-right">
                Merchant*
              </Label>
              <Input
                id="merchant"
                placeholder="e.g., Starbucks, Amazon"
                className="col-span-3"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment" className="text-right">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment" className="col-span-3">
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
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                placeholder="Additional details"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
