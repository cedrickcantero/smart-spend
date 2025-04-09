"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Calendar, Download, FileText, PieChart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseChart } from "@/components/expense-chart"

// Import recharts components
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts"

// Mock data for category breakdown
const categoryData = [
  { name: "Food & Dining", value: 420.32, color: "#0ea5e9" },
  { name: "Housing", value: 1550.0, color: "#3b82f6" },
  { name: "Transportation", value: 250.0, color: "#22c55e" },
  { name: "Entertainment", value: 180.0, color: "#eab308" },
  { name: "Shopping", value: 154.0, color: "#ef4444" },
  { name: "Utilities", value: 210.5, color: "#8b5cf6" },
  { name: "Health", value: 132.5, color: "#ec4899" },
  { name: "Other", value: 95.0, color: "#94a3b8" },
]

// Mock data for monthly comparison
const monthlyComparisonData = [
  { name: "Jan", current: 2580, previous: 2350 },
  { name: "Feb", current: 2690, previous: 2480 },
  { name: "Mar", current: 3100, previous: 2800 },
  { name: "Apr", current: 2854, previous: 2650 },
  { name: "May", current: 0, previous: 2900 },
  { name: "Jun", current: 0, previous: 3200 },
]

// Calculate total expenses
const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0)

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("month")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                4.3%
              </span>{" "}
              vs previous {timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$92.01</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                2.1%
              </span>{" "}
              vs previous {timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Housing</div>
            <p className="text-xs text-muted-foreground">
              ${categoryData.find((c) => c.name === "Housing")?.value.toFixed(2)} (
              {Math.round(((categoryData.find((c) => c.name === "Housing")?.value || 0) / totalExpenses) * 100)}% of
              total)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                8.1%
              </span>{" "}
              vs previous {timeframe}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trend</CardTitle>
              <CardDescription>Your spending over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ExpenseChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Your spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expenses</CardTitle>
                <CardDescription>Your largest expenses this {timeframe}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Rent Payment</div>
                        <div>$1,200.00</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[100%] rounded-full bg-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Grocery Store</div>
                        <div>$87.32</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[7%] rounded-full bg-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Electric Bill</div>
                        <div>$85.42</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[7%] rounded-full bg-purple-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-yellow-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Gym Membership</div>
                        <div>$50.00</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[4%] rounded-full bg-yellow-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Gas Station</div>
                        <div>$45.23</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[3.5%] rounded-full bg-red-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {categoryData.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                      <div className="font-medium">${category.value.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(category.value / totalExpenses) * 100}%`,

                            width: `${(category.value / totalExpenses) * 100}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((category.value / totalExpenses) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>How your spending has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparisonData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Legend />
                    <Bar name="Current Year" dataKey="current" fill="#0ea5e9" />
                    <Bar name="Previous Year" dataKey="previous" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Your spending is trending 7.2% higher compared to the same period last year.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Month-to-Month Comparison</CardTitle>
              <CardDescription>Compare your spending with previous periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Current Month</h3>
                    <div className="text-3xl font-bold">$2,854.00</div>
                    <div className="text-sm text-muted-foreground">32 transactions</div>

                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Top Categories</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Housing</span>
                          <span className="text-sm font-medium">$1,200.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Food & Dining</span>
                          <span className="text-sm font-medium">$420.32</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Transportation</span>
                          <span className="text-sm font-medium">$250.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Previous Month</h3>
                    <div className="text-3xl font-bold">$2,650.00</div>
                    <div className="text-sm text-muted-foreground">29 transactions</div>

                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Top Categories</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Housing</span>
                          <span className="text-sm font-medium">$1,200.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Food & Dining</span>
                          <span className="text-sm font-medium">$385.50</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Transportation</span>
                          <span className="text-sm font-medium">$220.75</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Month-over-Month Change</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Total Spending</span>
                      <span className="font-medium text-red-500">+$204.00 (+7.7%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Food & Dining</span>
                      <span className="font-medium text-red-500">+$34.82 (+9.0%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transportation</span>
                      <span className="font-medium text-red-500">+$29.25 (+13.2%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Housing</span>
                      <span className="font-medium text-muted-foreground">$0.00 (0.0%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
