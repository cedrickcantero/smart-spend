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
import { SubscriptionsService } from "@/app/api/subscriptions/service"
import { useToast } from "@/hooks/use-toast"
import { DBSubscription } from "@/types/supabase"

interface DeleteSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: DBSubscription
  fetchSubscriptions: () => void
}

export function DeleteSubscriptionModal({
  open,
  onOpenChange,
  subscription,
  fetchSubscriptions,
}: DeleteSubscriptionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await SubscriptionsService.deleteSubscription(subscription.id)
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      })
      onOpenChange(false)
      fetchSubscriptions()
    } catch (error) {
      console.error("Error deleting subscription:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  console.log("subscription", subscription)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subscription? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            You are about to delete the subscription of <span className="font-medium">${subscription.amount}</span> for{" "}
            <span className="font-medium">{subscription.name}</span> from{" "}
            <span className="font-medium">
              {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : "unknown date"}
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