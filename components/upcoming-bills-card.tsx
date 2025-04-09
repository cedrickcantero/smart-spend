import { CalendarClock } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function UpcomingBillsCard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Rent</p>
          <p className="text-sm text-muted-foreground">Due in 7 days</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            <CalendarClock className="mr-1 h-3 w-3" />
            Upcoming
          </Badge>
          <span className="font-medium">$1,200.00</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Electric Bill</p>
          <p className="text-sm text-muted-foreground">Due in 3 days</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-red-500 border-red-500">
            <CalendarClock className="mr-1 h-3 w-3" />
            Soon
          </Badge>
          <span className="font-medium">$85.42</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Internet</p>
          <p className="text-sm text-muted-foreground">Due in 12 days</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500">
            <CalendarClock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
          <span className="font-medium">$65.00</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Phone Bill</p>
          <p className="text-sm text-muted-foreground">Due in 18 days</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500">
            <CalendarClock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
          <span className="font-medium">$45.99</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Car Insurance</p>
          <p className="text-sm text-muted-foreground">Due in 23 days</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500">
            <CalendarClock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
          <span className="font-medium">$120.50</span>
        </div>
      </div>
    </div>
  )
}
