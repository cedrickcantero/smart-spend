"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format, setDate } from "date-fns"

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
import { DBCategory, DBExpense } from "@/types/supabase"
import { ExpenseService } from "@/app/api/expense/service"
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
  { value: "Credit Card", label: "Credit Card" },
  { value: "Debit Card", label: "Debit Card" },
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Mobile Payment", label: "Mobile Payment" },
]

interface EditExpenseModalProps {
  open: boolean
  expense: DBExpense
  onOpenChange: (open: boolean) => void
  fetchExpenses: () => void
  categories: DBCategory[]
}

export function EditExpenseModal({ open, onOpenChange, expense, fetchExpenses, categories }: EditExpenseModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [expenseData, setExpenseData] = useState<DBExpense>({
    id: expense.id,
    amount: expense.amount,
    merchant: expense.merchant,
    category: expense.category,
    date: expense.date,
    payment_method: expense.payment_method,
    notes: expense.notes,
    is_tax_deductible: expense.is_tax_deductible,
    receipt_url: expense.receipt_url,
  })



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!expenseData.amount || !expenseData.merchant || !expenseData.category) {
        throw new Error("Please fill in all required fields")
      }

      await ExpenseService.updateExpense(expenseData)
      toast({
        title: "Expense added",
        description: `$${expenseData.amount} expense to ${expenseData.merchant} has been added successfully.`,
      })
      resetForm()
      onOpenChange(false)
      fetchExpenses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setExpenseData({
      id: expense.id,
      amount: expense.amount,
      merchant: expense.merchant,
      category: expense.category,
      date: expense.date,
      payment_method: expense.payment_method,
      notes: expense.notes,
      is_tax_deductible: expense.is_tax_deductible,
      receipt_url: expense.receipt_url,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>Edit the details of your expense.</DialogDescription>
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
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: Number.parseFloat(e.target.value) || 0 })}
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
                value={expenseData.merchant}
                onChange={(e) => setExpenseData({ ...expenseData, merchant: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <Select value={expenseData.category_id} onValueChange={(value) => setExpenseData({ ...expenseData, category_id: value })} required>
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
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !expenseData.date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expenseData.date ? format(expenseData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={expenseData.date} onSelect={(date) => date && setExpenseData({ ...expenseData, date: date })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment" className="text-right">
                Payment
              </Label>
              <Select value={expenseData.payment_method} onValueChange={(value) => setExpenseData({ ...expenseData, payment_method: value })}>
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
                value={expenseData.notes}
                onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
