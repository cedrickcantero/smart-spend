"use client"

import React, { useState, useEffect } from "react"
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
import { DBCalendarEvent, DBCategory } from "@/types/supabase"
import { CalendarService } from "@/app/api/calendar/service"

interface EditEventModalProps {
  open: boolean
  event: DBCalendarEvent
  onOpenChange: (open: boolean) => void
  fetchEvents: () => void
  categories: DBCategory[]
}

export function EditEventModal({ open, onOpenChange, event, fetchEvents, categories }: EditEventModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventData, setEventData] = useState({
    id: event?.id,
    title: event?.title || '',
    amount: event?.amount || 0,
    category: event?.category || '',
    date: event?.date || new Date().toISOString().split('T')[0],
    is_recurring: event?.is_recurring || false,
    recurring_period: event?.recurring_period || '',
    notes: event?.notes || '',
    user_id: event?.user_id,
  })

  useEffect(() => {
    if (event) {
      setEventData({
        id: event.id,
        title: event.title || '',
        amount: event.amount || 0,
        category: event.category || '',
        date: event.date || new Date().toISOString().split('T')[0],
        is_recurring: event.is_recurring || false,
        recurring_period: event.recurring_period || '',
        notes: event.notes || '',
        user_id: event.user_id,
      });
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!eventData.title || !eventData.date) {
        throw new Error("Please fill in all required fields");
      }

      if (!eventData.amount) {
        throw new Error("Please enter an amount");
      }

      const selectedCategory = categories.find(cat => cat.id === eventData.category);
      const color = selectedCategory?.color || "bg-gray-500";
      
      const updateEventData = {
        ...eventData,
        color,
      };

      await CalendarService.updateCalendarEvent({
        ...updateEventData,
        created_at: event.created_at,
        updated_at: event.updated_at
      } as DBCalendarEvent);

      if (fetchEvents) {
        await fetchEvents();
      }

      toast({
        title: "Event updated",
        description: `"${eventData.title}" has been updated.`,
        variant: "success",
      });

      onOpenChange(false);
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
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
                  value={eventData.amount ?? ''}
                  onChange={(e) => setEventData({ ...eventData, amount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-category" className="text-right">
                Category
              </Label>
              <Select value={eventData.category ?? ''} onValueChange={(value) => setEventData({ ...eventData, category: value })}>
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
                    className={cn("col-span-3 justify-start text-left font-normal", !eventData.date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventData.date ? format(eventData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={eventData.date ? new Date(eventData.date) : undefined} 
                    onSelect={(date) => {
                      if (date) {
                        setEventData({ ...eventData, date: date.toISOString().split('T')[0] });
                        // Close the popover after selection
                        const popoverTrigger = document.querySelector('[data-state="open"]');
                        if (popoverTrigger) {
                          (popoverTrigger as HTMLElement).click();
                        }
                      }
                    }} 
                    initialFocus 
                  />
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
                  checked={eventData.is_recurring ?? false}
                  onCheckedChange={(checked) => setEventData({ ...eventData, is_recurring: checked === true })}
                />
                <label
                  htmlFor="event-recurring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  This is a recurring event
                </label>
              </div>
            </div>
            {eventData.is_recurring && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-recurring-period" className="text-right">
                  Repeat
                </Label>
                <Select value={eventData.recurring_period ?? ''} onValueChange={(value) => setEventData({ ...eventData, recurring_period: value })}>
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
                value={eventData.notes ?? ''}
                onChange={(e) => setEventData({ ...eventData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Editing..." : "Edit Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
