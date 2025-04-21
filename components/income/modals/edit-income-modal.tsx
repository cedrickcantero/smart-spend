"use client"

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
import { IncomeService } from "@/app/api/income/service"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DBCategory, DBIncome } from "@/types/supabase"

interface EditIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fetchIncome: () => Promise<void>
  income: DBIncome
  categories: DBCategory[]
}

export function EditIncomeModal({ open, onOpenChange, fetchIncome, income, categories }: EditIncomeModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [source, setSource] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [categoryId, setCategoryId] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open && income) {
      setSource(income.source || "")
      setAmount(income.amount.toString())
      setCategoryId(income.category_id || "")
      setNotes(income.description || "")
      
      if (income.date) {
        setDate(new Date(income.date))
      }
    }
  }, [open, income])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!source || !amount || !categoryId) {
        throw new Error("Please fill in all required fields")
      }

      await IncomeService.updateIncome({
        id: income.id,
        source,
        amount: parseFloat(amount),
        date: format(date, 'yyyy-MM-dd'),
        category_id: categoryId,
        description: notes, 
        created_at: income.created_at,
        is_taxable: income.is_taxable,
        payment_method: income.payment_method,
        updated_at: income.updated_at,
        user_id: income.user_id,
      });

      toast({
        title: "Income updated",
        description: `Income from "${source}" has been updated successfully.`,
        variant: "success",
      })

      onOpenChange(false)
      await fetchIncome()
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to update income. Please try again.",
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
          <DialogTitle>Edit Income</DialogTitle>
          <DialogDescription>Update your income entry details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="income-source" className="text-right">
                Source*
              </Label>
              <Input
                id="income-source"
                placeholder="e.g., Salary, Freelance"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="income-amount" className="text-right">
                Amount*
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="income-amount"
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
              <Label htmlFor="income-date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="income-date"
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
                    onSelect={(date) => setDate(date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="income-category" className="text-right">
                Category*
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="income-category" className="col-span-3">
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
              <Label htmlFor="income-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="income-notes"
                placeholder="Additional details (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
