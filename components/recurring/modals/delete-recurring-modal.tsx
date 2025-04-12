"use client"

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
import { RecurringService } from "@/app/api/recurring/service"
import { useToast } from "@/hooks/use-toast"
import { DBRecurringBill } from "@/types/supabase"

interface DeleteRecurringModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurringExpense: DBRecurringBill
  fetchRecurringExpenses: () => void
}

export function DeleteRecurringModal({
  open,
  onOpenChange,
  recurringExpense,
  fetchRecurringExpenses,
}: DeleteRecurringModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await RecurringService.deleteRecurringExpense(recurringExpense.id)
      toast({
        title: "Success",
        description: "Recurring expense deleted successfully",
        variant: "success",
      })
      onOpenChange(false)
      fetchRecurringExpenses()
    } catch (error) {
      console.error("Error deleting recurring expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete recurring expense",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Recurring Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this recurring expense? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete the recurring expense of <span className="font-medium">${recurringExpense.amount}</span> for{" "}
            <span className="font-medium">{recurringExpense.name}</span> from{" "}
            <span className="font-medium">
              {recurringExpense.next_due_date ? new Date(recurringExpense.next_due_date).toLocaleDateString() : "unknown date"}
            </span>.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}