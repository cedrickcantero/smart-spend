"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { DBCategory, DBExpense } from "@/types/supabase"
import { ExpenseService } from "@/app/api/expense/service"

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
    category_id: expense.category_id,
    date: expense.date,
    payment_method: expense.payment_method,
    description: expense.description,
    is_tax_deductible: expense.is_tax_deductible,
    receipt_url: expense.receipt_url,
    created_at: expense.created_at,
    updated_at: expense.updated_at,
    user_id: expense.user_id
  })

  useEffect(() => {
    if (open) {
      setExpenseData({
        id: expense.id,
        amount: expense.amount,
        merchant: expense.merchant,
        category_id: expense.category_id,
        date: expense.date,
        payment_method: expense.payment_method,
        description: expense.description,
        is_tax_deductible: expense.is_tax_deductible,
        receipt_url: expense.receipt_url,
        created_at: expense.created_at,
        updated_at: expense.updated_at,
        user_id: expense.user_id
      });
    }
  }, [expense, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!expenseData.amount || !expenseData.merchant || !expenseData.category_id) {
        throw new Error("Please fill in all required fields")
      }

      await ExpenseService.updateExpense(expenseData)
      toast({
        title: "Expense updated",
        description: `$${expenseData.amount} expense to ${expenseData.merchant} has been updated successfully.`,
        variant: "success",
      })
      resetForm()
      onOpenChange(false)
      fetchExpenses()
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to update expense. Please try again.",
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
      category_id: expense.category_id,
      date: expense.date,
      payment_method: expense.payment_method,
      description: expense.description,
      is_tax_deductible: expense.is_tax_deductible,
      receipt_url: expense.receipt_url,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      user_id: expense.user_id
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
              <Select value={expenseData.category_id || ""} onValueChange={(value) => setExpenseData({ ...expenseData, category_id: value })} required>
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
                    {expenseData.date ? format(new Date(expenseData.date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={expenseData.date ? new Date(expenseData.date) : undefined} 
                    onSelect={(date) => date && setExpenseData({ ...expenseData, date: date.toISOString() })} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment" className="text-right">
                Payment
              </Label>
              <Select value={expenseData.payment_method || ""} onValueChange={(value) => setExpenseData({ ...expenseData, payment_method: value })}>
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
                value={expenseData.description || ""}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
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
