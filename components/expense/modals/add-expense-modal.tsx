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
import { cn, getCurrencySymbol } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { DBCategory } from "@/types/supabase"
import { useAuth } from "@/app/contexts/AuthContext"
import { useExpenses } from "@/app/contexts/ExpenseContext"
import { useUserSettings } from "@/app/contexts/UserSettingsContext"

const paymentMethods = [
  { value: "Credit Card", label: "Credit Card" },
  { value: "Debit Card", label: "Debit Card" },
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Mobile Payment", label: "Mobile Payment" },
]

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fetchExpenses: () => void
  categories: DBCategory[]
}

type ExpenseFormData = {
  amount: number;
  merchant: string;
  category_id: string | null;
  date: string;
  description: string | null;
  payment_method: string | null;
  is_tax_deductible: boolean;
  receipt_url: string | null;
};

export function AddExpenseModal({ open, onOpenChange, fetchExpenses, categories }: AddExpenseModalProps) {
  const { toast } = useToast()
  const { addExpense } = useExpenses()
  const { user } = useAuth()
  const { userSettings } = useUserSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [merchant, setMerchant] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [expenseData, setExpenseData] = useState<ExpenseFormData>({
    amount: 0,
    merchant: "",
    category_id: null,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: null,
    payment_method: null,
    is_tax_deductible: false,
    receipt_url: null,
  })

  const userCurrency = userSettings?.preferences?.currency || "USD"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!expenseData.amount || !expenseData.merchant || !expenseData.category_id) {
        throw new Error("Please fill in all required fields")
      }

      if (!expenseData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error("Please select a valid category")
      }

      await addExpense({
        ...expenseData,
        user_id: user?.id || ''
      })

      toast({
        title: "Expense added",
        description: `${userCurrency} ${amount} expense to ${merchant} has been added successfully.`,
        variant: "success",
      })

      resetForm()
      onOpenChange(false)
      await fetchExpenses()
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
    setExpenseData({
      amount: 0,
      merchant: "",
      category_id: null,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: null,
      payment_method: null,
      is_tax_deductible: false,
      receipt_url: null,
    })
    setAmount("")
    setMerchant("")
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol(userCurrency)}</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setExpenseData({ ...expenseData, amount: Number.parseFloat(e.target.value) || 0 });
                  }}
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
                    className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => {
                    if (date) {
                      setDate(date);
                      setExpenseData({ ...expenseData, date: format(date, 'yyyy-MM-dd') });
                    }
                  }} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_method" className="text-right">
                Payment
              </Label>
              <Select value={expenseData.payment_method || ""} onValueChange={(value) => setExpenseData({ ...expenseData, payment_method: value })}>
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
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Additional details"
                className="col-span-3"
                value={expenseData.description || ""}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receipt_url" className="text-right">
                Receipt URL
              </Label>
              <Input
                id="receipt_url"
                type="url"
                placeholder="https://example.com/receipt"
                className="col-span-3"
                value={expenseData.receipt_url || ""}
                onChange={(e) => setExpenseData({ ...expenseData, receipt_url: e.target.value })}
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right"></div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="is_tax_deductible" 
                  checked={expenseData.is_tax_deductible}
                  onCheckedChange={(checked) => 
                    setExpenseData({ ...expenseData, is_tax_deductible: checked as boolean })
                  }
                />
                <Label htmlFor="is_tax_deductible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tax Deductible
                </Label>
              </div>
            </div> */}
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
