"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  Gift,
  Home,
  Plus,
  Receipt,
  Settings,
  ShoppingCart,
  Sparkles,
  Utensils,
  Wallet,
} from "lucide-react"
import { AddExpenseModal } from "@/components/add-expense-modal"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseChart } from "@/components/expense-chart"
import { ExpenseList } from "@/components/expense-list"
import { InsightCard } from "@/components/insight-card"
import { UpcomingBillsCard } from "@/components/upcoming-bills-card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"

export function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState("april")
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MobileNav />
        <MainNav className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex gap-1" onClick={() => setAddExpenseOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="default" size="sm" className="hidden md:flex gap-1">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </Button>
          <UserNav />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r px-4 py-6 md:flex">
          <nav className="grid gap-2">
            <Link href="#" className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-accent-foreground">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Receipt className="h-4 w-4" />
              Expenses
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <BadgeDollarSign className="h-4 w-4" />
              Budgets
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Tax Reports
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,254.32</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,000.00</div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[60%] rounded-full bg-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">62.7% of budget used</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,240.00</div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[45%] rounded-full bg-green-500" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">45% of vacation fund goal</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$427.89</div>
                <p className="text-xs text-muted-foreground">Potential tax savings this year</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="overview" className="mt-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedMonth("january")}>January</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedMonth("february")}>February</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedMonth("march")}>March</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedMonth("april")}>April</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                  <CardHeader>
                    <CardTitle>Expense Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ExpenseChart />
                  </CardContent>
                </Card>
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>Your spending by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Food & Dining</div>
                            <div>$420.32</div>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[35%] rounded-full bg-primary" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Housing</div>
                            <div>$350.00</div>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[28%] rounded-full bg-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Transportation</div>
                            <div>$250.00</div>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[20%] rounded-full bg-green-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-yellow-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Entertainment</div>
                            <div>$180.00</div>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[15%] rounded-full bg-yellow-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Shopping</div>
                            <div>$54.00</div>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[5%] rounded-full bg-red-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Your latest transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExpenseList />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Expenses
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Bills</CardTitle>
                    <CardDescription>Bills due in the next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UpcomingBillsCard />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Bills
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Analytics</CardTitle>
                  <CardDescription>Detailed analysis of your spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-10">
                    Advanced analytics charts and visualizations would be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="insights" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <InsightCard
                  title="Spending Anomaly Detected"
                  description="Your restaurant spending is 45% higher than usual this month."
                  icon={Utensils}
                  actionText="View Details"
                />
                <InsightCard
                  title="Subscription Optimization"
                  description="You could save $24.99/month by consolidating your streaming services."
                  icon={CreditCard}
                  actionText="See How"
                />
                <InsightCard
                  title="Smart Budget Recommendation"
                  description="Based on your spending patterns, we recommend increasing your grocery budget by $50."
                  icon={ShoppingCart}
                  actionText="Adjust Budget"
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Financial Insights</CardTitle>
                  <CardDescription>Personalized recommendations based on your spending habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="grid gap-1">
                          <h3 className="font-semibold">Spending Forecast</h3>
                          <p className="text-sm text-muted-foreground">
                            Based on your current spending patterns, you're projected to exceed your monthly budget by
                            $120. Consider reducing discretionary spending in the entertainment category.
                          </p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <ArrowUpRight className="h-4 w-4" />
                              View Detailed Forecast
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-green-500/10 p-3">
                          <BadgeDollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="grid gap-1">
                          <h3 className="font-semibold">Savings Opportunity</h3>
                          <p className="text-sm text-muted-foreground">
                            We've identified a potential tax deduction of $85 from your recent work-related expenses.
                            Make sure to categorize these properly for tax season.
                          </p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <ArrowUpRight className="h-4 w-4" />
                              Review Expenses
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="receipts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Scanner</CardTitle>
                  <CardDescription>Automatically extract expense data from receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10">
                    <Receipt className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-center">Drag & drop receipt images or click to upload</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">Supports JPG, PNG and PDF files</p>
                    <Button className="mt-4">Upload Receipt</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Scanned Receipts</CardTitle>
                  <CardDescription>Your recently processed receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-10">Your scanned receipts will appear here</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <AddExpenseModal open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
    </div>
  )
}
