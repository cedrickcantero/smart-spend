import { CreditCard, ShoppingCart, Utensils, Home, Car } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ExpenseList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>
            <Utensils className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">Starbucks Coffee</p>
          <p className="text-sm text-muted-foreground">April 23, 2023 • 10:45 AM</p>
        </div>
        <div className="ml-auto font-medium">-$4.50</div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>
            <ShoppingCart className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">Amazon.com</p>
          <p className="text-sm text-muted-foreground">April 22, 2023 • 2:34 PM</p>
        </div>
        <div className="ml-auto font-medium">-$29.99</div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>
            <Home className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">Rent Payment</p>
          <p className="text-sm text-muted-foreground">April 20, 2023 • 9:00 AM</p>
        </div>
        <div className="ml-auto font-medium">-$1,200.00</div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>
            <Utensils className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">Chipotle</p>
          <p className="text-sm text-muted-foreground">April 19, 2023 • 1:15 PM</p>
        </div>
        <div className="ml-auto font-medium">-$12.48</div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>
            <Car className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">Gas Station</p>
          <p className="text-sm text-muted-foreground">April 18, 2023 • 5:30 PM</p>
        </div>
        <div className="ml-auto font-medium">-$45.23</div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex border">
          <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Avatar" />
          <AvatarFallback>
            <CreditCard className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">Netflix Subscription</p>
          <p className="text-sm text-muted-foreground">April 15, 2023 • 12:00 AM</p>
        </div>
        <div className="ml-auto font-medium">-$14.99</div>
      </div>
    </div>
  )
}
