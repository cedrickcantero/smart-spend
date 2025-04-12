"use client"

import type React from "react"

import { useState } from "react"
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

// Mock categories
const budgetCategories = [
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

interface AddBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBudgetModal({ open, onOpenChange }: AddBudgetModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState("monthly")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!amount || !category) {
        throw new Error("Please fill in all required fields")
      }

      toast({
        title: "Budget created",
        description: `A ${period} budget of $${amount} for ${budgetCategories.find((c) => c.value === category)?.label} has been created.`,
        variant: "success",
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to create budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCategory("")
    setAmount("")
    setPeriod("monthly")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
          <DialogDescription>Set up a budget for a specific category.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget-category" className="text-right">
                Category*
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="budget-category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((category) => (
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
