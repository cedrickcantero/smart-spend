"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { BudgetService } from "@/app/api/budget/service"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DBBudget } from "@/types/supabase"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface EditBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBudgetUpdated?: () => void
  budget: DBBudget
}

export function EditBudgetModal({ open, onOpenChange, onBudgetUpdated, budget }: EditBudgetModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string | null }[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // Form state
  const [budgetName, setBudgetName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState("monthly")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [icon, setIcon] = useState("")
  const [isIncome, setIsIncome] = useState(false)

  // Fetch categories when modal opens and populate form with budget data
  useEffect(() => {
    if (open) {
      fetchCategories()
      populateFormWithBudgetData()
    }
  }, [open, budget])

  const populateFormWithBudgetData = () => {
    setBudgetName(budget.budget_name || "")
    setCategoryId(budget.category_id || "")
    setAmount(budget.amount.toString())
    setPeriod(budget.period || "monthly")
    setIsIncome(budget.is_income || false)
    
    if (budget.start_date) {
      setStartDate(new Date(budget.start_date))
    }
    
    if (budget.end_date) {
      setEndDate(new Date(budget.end_date))
    } else {
      setEndDate(undefined)
    }
    
    setIcon(budget.icon || "")
  }

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      // Convert from record to array
      if (typeof data === 'object' && !Array.isArray(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categoriesArray = Object.entries(data).map(([id, details]: [string, any]) => ({
          id,
          name: details.name,
          icon: details.icon
        }))
        setCategories(categoriesArray)
      } else if (Array.isArray(data)) {
        // If data is already an array
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!amount || !categoryId) {
        throw new Error("Please fill in all required fields")
      }

      // Find the selected category to get its icon
      const selectedCategory = categories.find((c) => c.id === categoryId)
      
      // Update the budget
      await BudgetService.updateBudget({
        id: budget.id,
        budget_name: budgetName || `${selectedCategory?.name || 'Unnamed'} Budget`,
        amount: parseFloat(amount),
        category_id: categoryId,
        period,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        icon: icon || selectedCategory?.icon || "📦",
        is_income: isIncome
      });

      toast({
        title: "Budget updated",
        description: `The ${period} ${isIncome ? 'income' : 'expense'} budget "${budgetName || `${selectedCategory?.name || 'Unnamed'} Budget`}" has been updated.`,
        variant: "success",
      })

      onOpenChange(false)
      if (onBudgetUpdated) onBudgetUpdated();
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to update budget. Please try again.",
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
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Update your budget settings.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget-type" className="text-right">
                Budget Type
              </Label>
              <RadioGroup 
                className="col-span-3 flex space-x-4" 
                value={isIncome ? "income" : "expense"}
                onValueChange={(value) => setIsIncome(value === "income")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget-name" className="text-right">
                Budget Name
              </Label>
              <Input
                id="budget-name"
                placeholder={isIncome ? "e.g., Monthly Salary" : "e.g., Monthly Groceries"}
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget-category" className="text-right">
                Category*
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="budget-category" className="col-span-3">
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
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
              <Label htmlFor="budget-amount" className="text-right">
                Amount*
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="budget-amount"
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
              <Label htmlFor="budget-period" className="text-right">
                Period
              </Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="budget-period" className="col-span-3">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => setStartDate(date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Optional end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => setEndDate(date)}
                    initialFocus
                    fromDate={startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
