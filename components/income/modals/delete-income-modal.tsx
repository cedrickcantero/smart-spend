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
import { DBIncome } from "@/types/supabase"
import { IncomeService } from "@/app/api/income/service"

interface DeleteIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  income: DBIncome
  fetchIncome: () => void
}

export function DeleteIncomeModal({ open, onOpenChange, income, fetchIncome }: DeleteIncomeModalProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await IncomeService.deleteIncome(income.id)
      
      toast({
        title: "Income deleted",
        description: `The income from ${income.source} has been deleted successfully.`,
        variant: "success",
      })
      
      onOpenChange(false)
      fetchIncome()
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to delete income. Please try again.",
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
          <DialogTitle>Delete Income</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this income? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete the income of <span className="font-medium">${income.amount}</span> from{" "}
            <span className="font-medium">{income.source}</span> on{" "}
            <span className="font-medium">
              {income.date ? new Date(income.date).toLocaleDateString() : "unknown date"}
            </span>.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Income"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}