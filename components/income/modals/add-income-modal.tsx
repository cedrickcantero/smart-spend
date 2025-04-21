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
import { IncomeService } from "@/app/api/income/service"
import { useUserSettings } from "@/app/contexts/UserSettingsContext"
import { Checkbox } from "@/components/ui/checkbox"

const paymentMethods = [
  { value: "Direct Deposit", label: "Direct Deposit" },
  { value: "Cash", label: "Cash" },
  { value: "Check", label: "Check" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "PayPal", label: "PayPal" },
]

interface AddIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fetchIncome: () => void
  categories: DBCategory[]
}

type IncomeFormData = {
  amount: number;
  source: string;
  category_id: string | null;
  date: string;
  description: string | null;
  payment_method: string | null;
  is_taxable: boolean;
};

export function AddIncomeModal({ open, onOpenChange, fetchIncome, categories }: AddIncomeModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [incomeData, setIncomeData] = useState<IncomeFormData>({
    amount: 0,
    source: "",
    category_id: null,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: null,
    payment_method: null,
    is_taxable: true,
  })

  const { userSettings } = useUserSettings()
  const userCurrency = userSettings?.preferences?.currency || "USD"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!incomeData.amount || !incomeData.source) {
        throw new Error("Please fill in all required fields")
      }

      if (incomeData.category_id && !incomeData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error("Please select a valid category")
      }

      await IncomeService.createIncome(incomeData)

      toast({
        title: "Income added",
        description: `${userCurrency} ${amount} income from ${source} has been added successfully.`,
        variant: "success",
      })

      resetForm()
      onOpenChange(false)
      await fetchIncome()
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to add income. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIncomeData({
      amount: 0,
      source: "",
      category_id: null,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: null,
      payment_method: null,
      is_taxable: true,
    })
    setAmount("")
    setSource("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>Enter the details of your income.</DialogDescription>
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
                    setIncomeData({ ...incomeData, amount: Number.parseFloat(e.target.value) || 0 });
                  }}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source*
              </Label>
              <Input
                id="source"
                placeholder="e.g., Salary, Freelance, Bonus"
                className="col-span-3"
                value={incomeData.source}
                onChange={(e) => setIncomeData({ ...incomeData, source: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={incomeData.category_id || ""} 
                onValueChange={(value) => setIncomeData({ ...incomeData, category_id: value })}
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
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                        setIncomeData({ ...incomeData, date: format(selectedDate, 'yyyy-MM-dd') });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-method" className="text-right">
                Payment Method
              </Label>
              <Select 
                value={incomeData.payment_method || ""} 
                onValueChange={(value) => setIncomeData({ ...incomeData, payment_method: value })}
              >
                <SelectTrigger id="payment-method" className="col-span-3">
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
                value={incomeData.description || ""}
                onChange={(e) => setIncomeData({ ...incomeData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right"></div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="is_taxable" 
                  checked={incomeData.is_taxable}
                  onCheckedChange={(checked) => 
                    setIncomeData({ ...incomeData, is_taxable: checked as boolean })
                  }
                />
                <Label htmlFor="is_taxable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Taxable Income
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 