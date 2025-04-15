"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Check, CreditCard, Edit, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AddBudgetModal } from "@/components/budget/modals/add-budget-modal"
import { EditBudgetModal } from "@/components/budget/modals/edit-budget-modal"
import { BudgetService, BudgetWithCategory } from "@/app/api/budget/service"
import { useToast } from "@/hooks/use-toast"
import { formatMoney } from "@/lib/utils"
import { DBBudget } from "@/types/supabase"
import { useAuth } from "@/lib/auth-context"
import { UserSettings } from "@/types/userSettings"

export default function BudgetsPage() {
  const [activeTab, setActiveTab] = useState("monthly")
  const [addBudgetOpen, setAddBudgetOpen] = useState(false)
  const [editBudgetOpen, setEditBudgetOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<DBBudget | null>(null)
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { userSettings: dbUserSettings } = useAuth()
  const userSettings = dbUserSettings as unknown as UserSettings
  const userCurrency = userSettings?.preferences?.currency || "USD"

  // Calculate budget summary
  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0)
  const totalRemaining = totalAllocated - totalSpent
  
  // Calculate daily target (remaining budget divided by days left in month)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const today = new Date().getDate()
  const daysRemaining = Math.max(1, daysInMonth - today + 1)
  const dailyTarget = totalRemaining > 0 ? totalRemaining / daysRemaining : 0

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    setIsLoading(true)
    try {
      const fetchedBudgets = await BudgetService.getBudgets()
      setBudgets(fetchedBudgets)
    } catch (error) {
      console.error("Error fetching budgets:", error)
      toast({
        title: "Error",
        description: "Failed to load budgets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBudget = (budget: DBBudget) => {
    setSelectedBudget(budget)
    setEditBudgetOpen(true)
  }

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await BudgetService.deleteBudget(budgetId)
      toast({
        title: "Budget deleted",
        description: "The budget has been successfully deleted.",
        variant: "success",
      })
      fetchBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
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
            <div className="text-2xl font-bold">{formatMoney(totalAllocated, userCurrency)}</div>
            <p className="text-xs text-muted-foreground">For current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalSpent, userCurrency)}</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalRemaining, userCurrency)}</div>
            <p className="text-xs text-muted-foreground">
              {totalAllocated > 0 ? Math.round((totalRemaining / totalAllocated) * 100) : 0}% of budget left
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Target</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(dailyTarget, userCurrency)}</div>
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
          {isLoading ? (
            <div className="flex justify-center p-8">Loading budgets...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.filter(budget => budget.period === 'monthly').map((budget) => (
                <Card key={budget.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{budget.icon}</span> {budget.budget_name || 'Uncategorized'}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditBudget(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {formatMoney(budget.spent || 0, userCurrency)} of {formatMoney(budget.amount, userCurrency)}
                    </CardDescription>
                    { budget.start_date && budget.end_date && (
                      <CardDescription className="text-xs mt-1">
                        {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{budget.amount > 0 ? Math.round(((budget.spent || 0) / budget.amount) * 100) : 0}%</span>
                      </div>
                      <Progress
                        value={budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0}
                        className="h-2"
                        indicatorClassName={getProgressColor(budget.status || 'default')}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>Remaining</span>
                        <span className={(budget.remaining || 0) < 0 ? "text-red-500 font-medium" : ""}>
                          {formatMoney(budget.remaining || 0, userCurrency)}
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
                    {!budget.status && (
                      <Badge variant="outline" className="w-full justify-center text-blue-500 border-blue-500 gap-1">
                        <TrendingUp className="h-3 w-3" /> Not Tracked
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
          )}
        </TabsContent>

        <TabsContent value="savings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Savings Goals</CardTitle>
              <CardDescription>Set and track your savings goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                Savings goals feature coming soon
              </div>
            </CardContent>
          </Card>
          {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    Target: {formatMoney(goal.target, userCurrency)} by {new Date(goal.deadline).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">
                        {formatMoney(goal.current, userCurrency)} / {formatMoney(goal.target, userCurrency)}
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
          </div> */}
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
      <AddBudgetModal 
        open={addBudgetOpen} 
        onOpenChange={setAddBudgetOpen} 
        onBudgetAdded={fetchBudgets}
      />
      {selectedBudget && (
        <EditBudgetModal
          open={editBudgetOpen}
          onOpenChange={setEditBudgetOpen}
          onBudgetUpdated={fetchBudgets}
          budget={selectedBudget}
        />
      )}
    </div>
  )
}
