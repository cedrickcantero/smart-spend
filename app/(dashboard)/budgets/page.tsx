"use client"

import { useState } from "react"
import { ArrowRight, Check, CreditCard, Edit, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AddBudgetModal } from "@/components/add-budget-modal"

// Mock budget data
const budgets = [
  {
    id: 1,
    category: "Food & Dining",
    allocated: 500,
    spent: 420.32,
    remaining: 79.68,
    status: "on-track", // on-track, warning, exceeded
    icon: "🍔",
  },
  {
    id: 2,
    category: "Transportation",
    allocated: 300,
    spent: 250,
    remaining: 50,
    status: "on-track",
    icon: "🚗",
  },
  {
    id: 3,
    category: "Entertainment",
    allocated: 200,
    spent: 180,
    remaining: 20,
    status: "warning",
    icon: "🎬",
  },
  {
    id: 4,
    category: "Shopping",
    allocated: 150,
    spent: 154,
    remaining: -4,
    status: "exceeded",
    icon: "🛍️",
  },
  {
    id: 5,
    category: "Utilities",
    allocated: 250,
    spent: 210.5,
    remaining: 39.5,
    status: "on-track",
    icon: "💡",
  },
  {
    id: 6,
    category: "Health",
    allocated: 150,
    spent: 132.5,
    remaining: 17.5,
    status: "warning",
    icon: "💊",
  },
]

// Mock savings goals
const savingsGoals = [
  {
    id: 1,
    name: "Vacation Fund",
    target: 5000,
    current: 2340,
    deadline: "2023-12-31",
    color: "bg-green-500",
  },
  {
    id: 2,
    name: "Emergency Fund",
    target: 10000,
    current: 4200,
    deadline: "2023-12-31",
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "New Car Fund",
    target: 15000,
    current: 1800,
    deadline: "2024-06-30",
    color: "bg-yellow-500",
  },
]

// Calculate total budget stats
const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0)
const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
const totalRemaining = totalAllocated - totalSpent

export default function BudgetsPage() {
  const [activeTab, setActiveTab] = useState("monthly")
  const [addBudgetOpen, setAddBudgetOpen] = useState(false)

  // Helper function to determine progress color
  const getProgressColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "exceeded":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Button className="gap-1" onClick={() => setAddBudgetOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(totalSpent / totalAllocated) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {Math.round((totalSpent / totalAllocated) * 100)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRemaining.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalRemaining / totalAllocated) * 100)}% of budget left
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Target</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$66.67</div>
            <p className="text-xs text-muted-foreground">To stay within budget</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly Budgets</TabsTrigger>
          <TabsTrigger value="savings">Savings Goals</TabsTrigger>
          <TabsTrigger value="annual">Annual Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{budget.icon}</span> {budget.category}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    ${budget.spent.toFixed(2)} of ${budget.allocated.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((budget.spent / budget.allocated) * 100)}%</span>
                    </div>
                    <Progress
                      value={(budget.spent / budget.allocated) * 100}
                      className="h-2"
                      indicatorClassName={getProgressColor(budget.status)}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>Remaining</span>
                      <span className={budget.remaining < 0 ? "text-red-500 font-medium" : ""}>
                        ${budget.remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  {budget.status === "on-track" && (
                    <Badge variant="outline" className="w-full justify-center text-green-500 border-green-500 gap-1">
                      <Check className="h-3 w-3" /> On Track
                    </Badge>
                  )}
                  {budget.status === "warning" && (
                    <Badge variant="outline" className="w-full justify-center text-yellow-500 border-yellow-500 gap-1">
                      <TrendingUp className="h-3 w-3" /> Getting Close
                    </Badge>
                  )}
                  {budget.status === "exceeded" && (
                    <Badge variant="outline" className="w-full justify-center text-red-500 border-red-500 gap-1">
                      <TrendingUp className="h-3 w-3" /> Exceeded
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-medium text-center">Create New Budget</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 mb-4">Set up a budget for a new category</p>
              <Button variant="outline" onClick={() => setAddBudgetOpen(true)}>
                Add Budget
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savingsGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{goal.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Target: ${goal.target.toFixed(2)} by {new Date(goal.deadline).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">
                        ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${goal.color}`}
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Completion</span>
                      <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Add Funds
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    Details
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-medium text-center">Create New Savings Goal</h3>
              <p className="text-sm text-muted-foreground text-center mt-1 mb-4">Set up a new savings target</p>
              <Button variant="outline">Add Goal</Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="annual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Annual Budget Planning</CardTitle>
              <CardDescription>Plan your budget for the entire year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Annual budget planning feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AddBudgetModal open={addBudgetOpen} onOpenChange={setAddBudgetOpen} />
    </div>
  )
}
