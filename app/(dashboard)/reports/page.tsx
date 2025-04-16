"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, Calendar, Download, FileText, PieChart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpenseChart } from "@/components/expense-chart"
import { ReportService } from "@/app/api/reports/service"

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
import { UserSettings } from "@/types/userSettings"
import { useAuth } from "@/lib/auth-context"
import { ReportSummary, CategoryBreakdown, TopExpense, MonthlyComparison } from "@/lib/services/reports-service"
import { formatMoney } from "@/lib/utils"

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("month")
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  // const [expenseTrends, setExpenseTrends] = useState<ExpenseTrend[]>([])
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison[]>([])
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([])
  const { userSettings: dbUserSettings } = useAuth()
  const userSettings = dbUserSettings as unknown as UserSettings
  const userCurrency = userSettings?.preferences?.currency || "USD"

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const summary = await ReportService.getReportSummary(timeframe)
        const categories = await ReportService.getCategoryBreakdown(timeframe)
        // const trends = await ReportService.getExpenseTrends(timeframe)
        const comparison = await ReportService.getMonthlyComparison()
        const top = await ReportService.getTopExpenses(timeframe, 5)
        
        setReportSummary(summary)
        setCategoryBreakdown(categories)
        // setExpenseTrends(trends)
        setMonthlyComparison(comparison)
        setTopExpenses(top)
      } catch (error) {
        console.error("Error fetching report data:", error)
      }
    }
    
    fetchReportData()
  }, [timeframe])

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
            <div className="text-2xl font-bold">{formatMoney(reportSummary?.totalExpenses || 0, userCurrency)}</div>
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
            <div className="text-2xl font-bold">{formatMoney(reportSummary?.averageDaily || 0, userCurrency)}</div>
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
            <div className="text-2xl font-bold">{categoryBreakdown[0]?.name}</div>
            <p className="text-xs text-muted-foreground">
              {formatMoney(categoryBreakdown[0]?.value || 0, userCurrency)} (
              {Math.round(((categoryBreakdown[0]?.value || 0) / (reportSummary?.totalExpenses || 0)) * 100)}% of
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
            <div className="text-2xl font-bold">{reportSummary?.transactionCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                {reportSummary?.previousChange?.toFixed(2)}%
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
          {/* <TabsTrigger value="comparison">Comparison</TabsTrigger> */}
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

          <div className="grid gap-4 md:grid-cols-1">
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
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {categoryBreakdown.map((entry, index) => (
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
                  {topExpenses.map((expense) => (
                    <div key={expense.title} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: expense.color }} />
                        <div className="font-medium">{expense.title}</div>
                      </div>
                      <div className="font-medium">{formatMoney(expense.amount, userCurrency)}</div>
                    </div>
                  ))}
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
                {categoryBreakdown.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                      <div className="font-medium">{formatMoney(category.value, userCurrency)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(category.value / (reportSummary?.totalExpenses || 0)) * 100}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((category.value / (reportSummary?.totalExpenses || 0)) * 100)}%
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
                  <BarChart data={monthlyComparison} margin={{ left: 50, right: 10 }}>
                    <XAxis dataKey="name" />
                    <YAxis width={70} tickFormatter={(value) => formatMoney(value, userCurrency)} />
                    <Tooltip formatter={(value: number) => [formatMoney(value, userCurrency), "Amount"]} />
                    <Legend />
                    <Bar name="Current Year" dataKey="current" fill="#0ea5e9" />
                    <Bar name="Previous Year" dataKey="previous" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Your spending is trending {reportSummary?.previousChange?.toFixed(2)}% higher compared to the same period last year.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* <TabsContent value="comparison" className="mt-4">
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
        </TabsContent> */}
      </Tabs>
    </div>
  )
}