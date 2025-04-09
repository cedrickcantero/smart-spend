import Link from "next/link"
import { ArrowRight, BarChart3, CreditCard, DollarSign, Receipt, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <DollarSign className="h-6 w-6" />
          <span>ExpenseTracker</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Manage Your Finances with Ease
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Track expenses, set budgets, and gain insights into your spending habits with our powerful expense
                    tracking app.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-muted/30 border p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg bg-background p-4 shadow-sm border">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-5 w-5 text-primary" />
                          <div className="font-medium">Track Expenses</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-background p-4 shadow-sm border">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div className="font-medium">Manage Budgets</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="rounded-lg bg-background p-4 shadow-sm border">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <div className="font-medium">View Reports</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-background p-4 shadow-sm border">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <div className="font-medium">AI Insights</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Features That Make a Difference
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our expense tracker comes with powerful features to help you take control of your finances.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Receipt className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Expense Tracking</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Easily log and categorize your expenses to keep track of where your money goes.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CreditCard className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Budget Management</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Set budgets for different categories and get alerts when you're close to your limits.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <BarChart3 className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Detailed Reports</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Visualize your spending patterns with interactive charts and reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 ExpenseTracker. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
