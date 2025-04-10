"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddEventModal } from "@/components/calendar/modals/add-event-modal"
import { useAuth } from "@/lib/auth-context"
import { CalendarService } from "@/app/api/calendar/service"
import { DBCalendarEvent } from "@/types/supabase"
import { EditEventModal } from "@/components/calendar/modals/edit-event-modal"

export default function CalendarPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState("month")
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState<DBCalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editEventOpen, setEditEventOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<DBCalendarEvent | null>(null)
  const { user } = useAuth()

  const fetchEvents = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const response = await CalendarService.getCalendarEvents()
      setCalendarEvents(response)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setCalendarEvents([])
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchEvents()
  }, [user])

  const categories = {
    "Education": "bg-blue-500",
    "Food & Dining": "bg-purple-500",
    "Shopping": "bg-pink-500",
    "Personal": "bg-yellow-500",
    "Health": "bg-green-500",
    "Entertainment": "bg-gray-500",
    "Housing": "bg-red-500",
    "Utilities": "bg-orange-500",
    "Transportation": "bg-teal-500",
    "Travel": "bg-cyan-500",
    "Groceries": "bg-lime-500",
    "Other": "bg-gray-500"
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventsForDate = (dateString: string, events: DBCalendarEvent[]) => {
    return events.filter((event) => event.date === dateString)
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarDays = []

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, isCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateString = date.toISOString().split("T")[0]
    const events = getEventsForDate(dateString, calendarEvents)

    calendarDays.push({
      day,
      date: dateString,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      events,
    })
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate, calendarEvents) : []

  const handleEventAdded = async () => {
    setAddEventOpen(true)
  }

  const handleEventUpdated = async (event: DBCalendarEvent) => {
    const latestEvent = calendarEvents.find(e => e.id === event.id);
    if (latestEvent) {
      setSelectedEvent(latestEvent);
      setEditEventOpen(true);
    } else {
      console.error('Event not found:', event.id);
    }
  }

  const handleEditModalClose = (open: boolean) => {
    setEditEventOpen(open);
    if (!open) {
      setSelectedEvent(null);
    }
  }

  const handleEventDeleted = async (id: string) => {
    try {
      await CalendarService.deleteCalendarEvent(id)
      setCalendarEvents(calendarEvents.filter(event => event.id !== id))
      
      if (selectedDate) {
        const updatedEvents = getEventsForDate(selectedDate, calendarEvents.filter(event => event.id !== id))
        if (updatedEvents.length === 0) {
          setSelectedDate(null)
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex gap-2">
            <Select defaultValue={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-1" onClick={handleEventAdded}>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-bold">
                    {monthName} {currentYear}
                  </h2>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMonth(today.getMonth())
                    setCurrentYear(today.getFullYear())
                  }}
                >
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium py-1">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-1 border rounded-md
                      ${day.isCurrentMonth ? "bg-card" : "bg-muted/30 text-muted-foreground"}
                      ${day.isToday ? "border-primary" : "border-border"}
                      ${selectedDate === day.date ? "ring-2 ring-primary ring-offset-2" : ""}
                      hover:bg-accent hover:text-accent-foreground cursor-pointer
                    `}
                    onClick={() => day.date && setSelectedDate(day.date)}
                  >
                    {day.day && (
                      <>
                        <div className="text-right text-sm font-medium">{day.day}</div>
                        <div className="mt-1 space-y-1">
                          {day.events &&
                            day.events.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${event.color} text-white`}
                              >
                                {event.title}
                              </div>
                            ))}
                          {day.events && day.events.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">+{day.events.length - 3} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("default", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "expense" : "expenses"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateEvents.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-2 p-2 rounded-md border">
                        <div className={`w-2 h-full self-stretch rounded-full ${event.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <span className="font-medium">${event.amount?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-normal">
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mb-2" />
                    <h3 className="font-medium">No expenses for this date</h3>
                    <p className="text-sm mt-1">Select a different date or add a new expense</p>
                    <Button variant="outline" className="mt-4 gap-1" onClick={handleEventAdded}>
                      <Plus className="h-4 w-4" />
                      Add Expense
                    </Button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mb-2" />
                  <h3 className="font-medium">Select a date</h3>
                  <p className="text-sm mt-1">Click on a date to view expenses</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Expenses</CardTitle>
            <CardDescription>Scheduled expenses for the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {calendarEvents
              .filter(event => new Date(event.date) >= new Date())
              .map((event) => (
                <div key={event.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <div className={`${categories[event.category as keyof typeof categories]} w-3 h-3 rounded-full`} />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${event.amount?.toFixed(2) || "0.00"}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-500 hover:text-red-700" 
                      onClick={() => handleEventUpdated(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700" 
                      onClick={() => handleEventDeleted(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
              </div>
            </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <AddEventModal
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        initialDate={selectedDate ? new Date(selectedDate) : undefined}
        onEventAdded={handleEventAdded}
        fetchEvents={fetchEvents}
      />
      {selectedEvent && (
        <EditEventModal
          open={editEventOpen}
          onOpenChange={handleEditModalClose}
          event={selectedEvent}
          onEventUpdated={handleEventUpdated}
          fetchEvents={fetchEvents}
        />
      )}
    </>
  )
}

