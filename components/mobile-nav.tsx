"use client"

import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-foreground">
            Dashboard
          </Link>
          <Link href="/income" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Income
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Expenses
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Reports
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Budgets
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Calendar
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Tax Reports
          </Link>
          <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            Settings
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
