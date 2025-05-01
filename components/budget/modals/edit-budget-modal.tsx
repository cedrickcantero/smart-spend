"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { cn, getCurrencySymbol } from "@/lib/utils"
import { DBBudget } from "@/types/supabase"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCategories } from "@/app/contexts/CategoriesContext"
import { useUserSettings } from "@/app/contexts/UserSettingsContext"
import { Switch } from "@/components/ui/switch"
import { BudgetSettings } from "@/types/budgetSettings"

interface EditBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBudgetUpdated?: () => void
  budget: DBBudget
}

export function EditBudgetModal({ open, onOpenChange, onBudgetUpdated, budget }: EditBudgetModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { categories } = useCategories()
  const { userSettings } = useUserSettings()
  const userCurrency = userSettings?.preferences?.currency as unknown as string || 'USD'

  const [budgetData, setBudgetData] = useState({
    id: budget.id,
    budget_name: budget.budget_name,
    amount: budget.amount,
    category_id: budget.category_id,
    period: budget.period,
    start_date: budget.start_date,
    end_date: budget.end_date,
    is_income: budget.is_income,
    icon: budget.icon,
    user_id: budget.user_id,
    settings: budget.settings,
  })

  useEffect(() => {
    if (budget) {
      setBudgetData({
        id: budget.id,
        budget_name: budget.budget_name,
        amount: budget.amount,
        category_id: budget.category_id,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date,
        is_income: budget.is_income,
        icon: budget.icon,
        user_id: budget.user_id,
        settings: budget.settings,
      })
    }
  }, [budget, open])

  console.log("budgetData", budgetData)

  const handleReoccurringChange = (checked: boolean) => {
    if (!budgetData.settings) return;
    
    // Create a safe copy with proper casting
    const currentSettings = budgetData.settings as any;
    const tracking = currentSettings.tracking || {};
    
    setBudgetData({
      ...budgetData,
      settings: {
        ...currentSettings,
        tracking: {
          ...tracking,
          reoccurring: checked
        }
      }
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!budgetData.amount || !budgetData.category_id) {
        throw new Error("Please fill in all required fields")
      }

      const selectedCategory = categories.find((c) => c.id === budgetData.category_id)
      
      await BudgetService.updateBudget({
        id: budget.id,
        budget_name: budgetData.budget_name || `${selectedCategory?.name || 'Unnamed'} Budget`,
        amount: budgetData.amount,
        category_id: budgetData.category_id,
        period: budgetData.period,
        start_date: format(budgetData.start_date, 'yyyy-MM-dd'),
        end_date: budgetData.end_date ? format(budgetData.end_date, 'yyyy-MM-dd') : null,
        icon: selectedCategory?.icon || "📦",
        is_income: budgetData.is_income,
        settings: budgetData.settings
      });

      toast({
        title: "Budget updated",
        description: `The ${budgetData.period} ${budgetData.is_income ? 'income' : 'expense'} budget "${budgetData.budget_name || `${selectedCategory?.name || 'Unnamed'} Budget`}" has been updated.`,
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
                value={budgetData.is_income ? "income" : "expense"}
                onValueChange={(value) => setBudgetData({ ...budgetData, is_income: value === "income" })}
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
                placeholder={budgetData.is_income ? "e.g., Monthly Salary" : "e.g., Monthly Groceries"}
                value={budgetData.budget_name || ""}
                onChange={(e) => setBudgetData({ ...budgetData, budget_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget-category" className="text-right">
                Category*
              </Label>
              <Select value={budgetData.category_id || ""} onValueChange={(value) => setBudgetData({ ...budgetData, category_id: value })} required>
                <SelectTrigger id="budget-category" className="col-span-3">
                  <SelectValue placeholder={categories.length === 0 ? "Loading categories..." : "Select category"} />
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol(userCurrency)}</span>
                <Input
                  id="budget-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  value={budgetData.amount}
                  onChange={(e) => setBudgetData({ ...budgetData, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget-period" className="text-right">
                Period
              </Label>
              <Select value={budgetData.period} onValueChange={(value) => setBudgetData({ ...budgetData, period: value })}>
                <SelectTrigger id="budget-period" className="col-span-3">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
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
                      !budgetData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {budgetData.start_date ? format(budgetData.start_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={budgetData.start_date ? new Date(budgetData.start_date) : undefined}
                    onSelect={(date) => setBudgetData({ ...budgetData, start_date: date?.toISOString() || "" })}
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
                      !budgetData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {budgetData.end_date ? format(budgetData.end_date, "PPP") : <span>Optional end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={budgetData.end_date ? new Date(budgetData.end_date) : undefined}
                    onSelect={(date) => setBudgetData({ ...budgetData, end_date: date?.toISOString() || "" })}
                    initialFocus
                    fromDate={budgetData.start_date ? new Date(budgetData.start_date) : undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reoccurring" className="text-right">
              Reoccurring
            </Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="reoccurring" 
                checked={
                  // Handle any type of settings object safely
                  typeof budgetData.settings === 'object' && 
                  budgetData.settings !== null && 
                  typeof (budgetData.settings as any).tracking === 'object' &&
                  Boolean((budgetData.settings as any).tracking?.reoccurring)
                } 
                onCheckedChange={handleReoccurringChange} 
              />
              <span className="text-sm text-gray-500">
                Automatically reset at the start of each {budgetData.period}
              </span>
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
