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
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { DBCalendarEvent, DBCalendarEventInsert, DBCategory } from "@/types/supabase"
import { CalendarService } from "@/app/api/calendar/service"
import { useAuth } from "@/lib/auth-context"

interface AddEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: Date
  categories: DBCategory[]
  onEventAdded?: (event: DBCalendarEvent) => void
  fetchEvents?: () => void
}

export function AddEventModal({ open, onOpenChange, initialDate, categories, onEventAdded, fetchEvents }: AddEventModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(categories[0].id)
  const [date, setDate] = useState<Date>(initialDate || new Date())
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPeriod, setRecurringPeriod] = useState("monthly")
  const [notes, setNotes] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!title || !date) {
        throw new Error("Please fill in all required fields")
      }

      if (!amount) {
        throw new Error("Please enter an amount")
      }

      const formattedDate = date.toISOString().split('T')[0];
      
      const selectedCategory = categories.find(cat => cat.id === category);
      const color = selectedCategory?.color || "bg-gray-500";
      
      const eventData: DBCalendarEventInsert = {
        title,
        amount: Number.parseFloat(amount),
        category,
        date: formattedDate,
        color,
        is_recurring: isRecurring,
        recurring_period: isRecurring ? recurringPeriod : null,
        notes,
        user_id: user?.id || "",
      };

      const event = await CalendarService.createCalendarEvent(eventData as DBCalendarEvent);

      toast({
        title: "Event added",
        description: `"${title}" has been added to your calendar.`,
        variant: "success",
      });

      if (onEventAdded && event) {
        onEventAdded(event as DBCalendarEvent);
      }

      if (fetchEvents) {
        fetchEvents();
      }

      resetForm()
      onOpenChange(false)
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to add event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setAmount("")
    setCategory("expense")
    setDate(new Date())
    setIsRecurring(false)
    setRecurringPeriod("monthly")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>Schedule an expense, bill, or reminder.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title*
              </Label>
              <Input
                id="event-title"
                placeholder="e.g., Rent Payment, Phone Bill"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="event-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="event-category" className="col-span-3">
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
              <Label htmlFor="event-date" className="text-right">
                Date*
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="event-recurring">Recurring</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="event-recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked === true)}
                />
                <label
                  htmlFor="event-recurring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  This is a recurring event
                </label>
              </div>
            </div>
            {isRecurring && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-recurring-period" className="text-right">
                  Repeat
                </Label>
                <Select value={recurringPeriod} onValueChange={setRecurringPeriod}>
                  <SelectTrigger id="event-recurring-period" className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="event-notes"
                placeholder="Additional details"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
