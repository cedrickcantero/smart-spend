"use client"

import { useState } from "react"
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Brain,
  CreditCard,
  DollarSign,
  LineChart,
  MessageSquare,
  PieChart,
  Send,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InsightCard } from "@/components/insight-card"

export default function AIInsightsPage() {
  const [query, setQuery] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <Button className="gap-1">
          <Sparkles className="h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Ask AI Assistant</CardTitle>
          <CardDescription>Ask questions about your finances and get AI-powered answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg bg-muted p-3">
                    <p className="text-sm">
                      Hello! I'm your AI financial assistant. I can help you understand your spending patterns, suggest
                      ways to save money, and answer questions about your finances. What would you like to know?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="flex-1 rounded-lg bg-primary text-primary-foreground p-3">
                    <p className="text-sm">How much did I spend on dining out last month?</p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg bg-muted p-3">
                    <p className="text-sm">
                      Last month, you spent a total of $420.32 on dining out. This is about 16.5% of your total monthly
                      expenses. This is also 8.2% higher than your average monthly dining expenses over the past 6
                      months.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about your finances..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                How much did I save last month?
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Where can I reduce spending?
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                Am I on track with my budget?
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                What are my biggest expenses?
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">Key Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-4 space-y-4">
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
                        Based on your current spending patterns, you're projected to exceed your monthly budget by $120.
                        Consider reducing discretionary spending in the entertainment category.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <ArrowRight className="h-4 w-4" />
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
                        We've identified a potential tax deduction of $85 from your recent work-related expenses. Make
                        sure to categorize these properly for tax season.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <ArrowRight className="h-4 w-4" />
                          Review Expenses
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <LineChart className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="font-semibold">Spending Pattern</h3>
                      <p className="text-sm text-muted-foreground">
                        Your spending tends to increase significantly on weekends. Setting a weekend budget could help
                        you manage your finances better.
                      </p>
                      <div className="mt-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <ArrowRight className="h-4 w-4" />
                          See Pattern Analysis
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your financial health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-500/10 p-3">
                      <TrendingDown className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Reduce Food Delivery Expenses</h3>
                        <Badge className="bg-green-500">High Impact</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You spent $185 on food delivery services last month. Cooking at home more often could save you
                        approximately $120 per month.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          Implement
                        </Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-500/10 p-3">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Consolidate Subscriptions</h3>
                        <Badge className="bg-blue-500">Medium Impact</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You have 5 active streaming subscriptions totaling $64.95/month. Consider a bundle package or
                        reducing to your most-used services.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          View Subscriptions
                        </Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-yellow-500/10 p-3">
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Increase Emergency Fund</h3>
                        <Badge className="bg-yellow-500">Long-term</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your emergency fund covers 2.5 months of expenses. We recommend increasing it to cover at least
                        3-6 months.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          Set Up Auto-Save
                        </Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-purple-500/10 p-3">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Adjust Category Budgets</h3>
                        <Badge className="bg-purple-500">Optimization</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on your spending patterns, we recommend decreasing your entertainment budget by $50 and
                        increasing your groceries budget by $50.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm">
                          Adjust Budgets
                        </Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,950.00</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500 inline-flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +5.2%
                  </span>{" "}
                  vs current month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Forecast</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$450.00</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 inline-flex items-center">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +12.5%
                  </span>{" "}
                  vs current month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">Caution</div>
                <p className="text-xs text-muted-foreground">Projected to exceed by $150</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">On Track</div>
                <p className="text-xs text-muted-foreground">Vacation fund by Dec 2023</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Forecasts</CardTitle>
              <CardDescription>AI-powered predictions for your future finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">3-Month Expense Forecast</h3>
                  <div className="h-[200px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    [Expense Forecast Chart]
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on your historical spending patterns and upcoming scheduled payments, we project your expenses
                    to increase slightly over the next 3 months, with a peak in June due to planned travel expenses.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Savings Goal Projection</h3>
                  <div className="h-[200px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    [Savings Projection Chart]
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    At your current savings rate, you'll reach your vacation fund goal of $5,000 by December 2023, which
                    aligns with your target date.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Cash Flow Prediction</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">May 2023</span>
                      <span className="text-sm font-medium text-green-500">+$450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">June 2023</span>
                      <span className="text-sm font-medium text-yellow-500">+$250</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">July 2023</span>
                      <span className="text-sm font-medium text-green-500">+$500</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your cash flow is projected to remain positive over the next 3 months, with a slight dip in June due
                    to planned travel expenses.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-1">
                <MessageSquare className="h-4 w-4" />
                Ask AI About Your Financial Future
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
