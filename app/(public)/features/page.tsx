import Link from "next/link"
import { ArrowRight, BarChart3, CreditCard, DollarSign, FileText, Receipt, Sparkles, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <DollarSign className="h-6 w-6" />
          <span>ExpenseTracker</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/features" className="text-sm font-medium underline underline-offset-4">
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Discover all the powerful features that make ExpenseTracker the best choice for managing your
                  finances.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 shadow-sm">
                <Receipt className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Expense Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Easily log and categorize your expenses to keep track of where your money goes. Supports multiple
                  currencies and receipt scanning.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 shadow-sm">
                <Wallet className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Budget Management</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Set budgets for different categories and get alerts when you&apos;re close to your limits. Track your
                  progress with visual indicators.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 shadow-sm">
                <BarChart3 className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Detailed Reports</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Visualize your spending patterns with interactive charts and reports. Export data in various formats
                  for further analysis.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 shadow-sm">
                <Sparkles className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">AI Insights</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Get personalized financial insights powered by AI. Identify spending patterns and receive
                  recommendations to save money.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 shadow-sm">
                <FileText className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Tax Reports</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Automatically identify tax-deductible expenses and generate reports for tax season. Save time and
                  maximize your deductions.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 rounded-lg border p-6 shadow-sm">
                <CreditCard className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Bill Reminders</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Never miss a payment with bill reminders. Schedule recurring expenses and get notified before due
                  dates.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-1">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
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
