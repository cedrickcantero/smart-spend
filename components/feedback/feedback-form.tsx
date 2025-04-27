"use client"

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FeedbackService, FeedbackCreate } from "@/app/api/feedback/service"

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackForm({ open, onOpenChange }: FeedbackFormProps) {
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackType, setFeedbackType] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return

    setIsSubmitting(true)
    try {
      const feedback: FeedbackCreate = {
        feedback_text: feedbackText,
        feedback_type: feedbackType,
        status: "new",
        is_resolved: false
      }
      
      await FeedbackService.createFeedback(feedback)

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We appreciate your input.",
        variant: "success",
      })
      setFeedbackText("")
      setFeedbackType("general")
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share your thoughts, suggestions, or report issues to help us improve.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="feedback-type" className="text-sm font-medium">
              Type
            </label>
            <Select 
              value={feedbackType} 
              onValueChange={setFeedbackType}
              name="feedback-type"
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="suggestion">Feature Suggestion</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="feedback" className="text-sm font-medium">
              Feedback
            </label>
            <Textarea
              id="feedback"
              placeholder="Tell us what you think..."
              value={feedbackText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFeedbackText(e.target.value)}
              className="col-span-3"
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSubmitting || !feedbackText.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 