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
import { useToast } from "@/hooks/use-toast"
import { DBExpense } from "@/types/supabase"
import { ExpenseService } from "@/app/api/expense/service"

interface DeleteExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: DBExpense
  fetchExpenses: () => void
}

export function DeleteExpenseModal({ open, onOpenChange, expense, fetchExpenses }: DeleteExpenseModalProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await ExpenseService.deleteExpense(expense.id)
      
      toast({
        title: "Expense deleted",
        description: `The expense for ${expense.merchant} has been deleted successfully.`,
      })
      
      onOpenChange(false)
      fetchExpenses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete the expense of <span className="font-medium">${expense.amount}</span> for{" "}
            <span className="font-medium">{expense.merchant}</span> from{" "}
            <span className="font-medium">
              {expense.date ? new Date(expense.date).toLocaleDateString() : "unknown date"}
            </span>.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
