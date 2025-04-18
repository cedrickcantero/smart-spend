"use client"

import { useEffect, useState } from "react"
import { Check, CreditCard, Edit, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react"
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
import { DBBudget, DBExpense, DBIncome } from "@/types/supabase"
import { useAuth } from "@/lib/auth-context"
import { UserSettings } from "@/types/userSettings"
import { ExpenseService } from "@/app/api/expense/service"
import { IncomeService } from "@/app/api/income/service"

export default function BudgetsPage() {
  const [activeTab, setActiveTab] = useState("monthly")
  const [addBudgetOpen, setAddBudgetOpen] = useState(false)
  const [editBudgetOpen, setEditBudgetOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<DBBudget | null>(null)
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [expenses, setExpenses] = useState<DBExpense[]>([])
  const [income, setIncome] = useState<DBIncome[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { userSettings: dbUserSettings } = useAuth()
  const userSettings = dbUserSettings as unknown as UserSettings
  const userCurrency = userSettings?.preferences?.currency || "USD"

  const getExpensesByCategory = () => {
    const expensesByCategory: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (expense.category_id) {
        if (!expensesByCategory[expense.category_id]) {
          expensesByCategory[expense.category_id] = 0;
        }
        expensesByCategory[expense.category_id] += expense.amount || 0;
      }
    });
    
    return expensesByCategory;
  };

  const getIncomeByCategory = () => {
    const incomeByCategory: Record<string, number> = {};
    
    income.forEach(item => {
      if (item.category_id) {
        if (!incomeByCategory[item.category_id]) {
          incomeByCategory[item.category_id] = 0;
        }
        incomeByCategory[item.category_id] += item.amount || 0;
      }
    });
    
    return incomeByCategory;
  };

  const updateBudgetsWithData = () => {
    const expensesByCategory = getExpensesByCategory();
    const incomeByCategory = getIncomeByCategory();
    
    const updatedBudgets = budgets.map(budget => {
      const categoryId = budget.category_id;
      
      if (budget.is_income) {
        const incomeAmount = categoryId ? incomeByCategory[categoryId] || 0 : 0;
        const remainingAmount = budget.amount - incomeAmount;
        
        let status = "on-track";
        const percentMet = budget.amount > 0 ? (incomeAmount / budget.amount) * 100 : 0;
        
        if (percentMet >= 100) {
          status = "exceeded";
        } else if (percentMet === 100) {
          status = "complete";
        } else if (percentMet >= 75) {
          status = "approaching";
        }
        
        return {
          ...budget,
          spent: incomeAmount,
          remaining: remainingAmount,
          status
        };
      } 
      else {
        const spentAmount = categoryId ? expensesByCategory[categoryId] || 0 : 0;
        const remainingAmount = budget.amount - spentAmount;
        
        let status = "on-track";
        const percentSpent = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
        
        if (percentSpent >= 100) {
          status = "exceeded";
        } else if (percentSpent === 100) {
          status = "complete";
        } else if (percentSpent >= 75) {
          status = "warning";
        }
        
        return {
          ...budget,
          spent: spentAmount,
          remaining: remainingAmount,
          status
        };
      }
    });
    
    return updatedBudgets;
  };

  const processedBudgets = (expenses.length || income.length) && budgets.length ? updateBudgetsWithData() : budgets;
  
  const expenseBudgets = processedBudgets.filter(budget => !budget.is_income);
  const incomeBudgets = processedBudgets.filter(budget => budget.is_income);
  
  const totalExpenseBudget = expenseBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalExpenseSpent = expenseBudgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const totalExpenseRemaining = totalExpenseBudget - totalExpenseSpent;
  
  const totalIncomeBudget = incomeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalIncomeReceived = incomeBudgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  // const totalIncomeRemaining = totalIncomeBudget - totalIncomeReceived;
   
  const totalActualIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalActualExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netCashflow = totalActualIncome - totalActualExpenses;
  
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const daysRemaining = Math.max(1, daysInMonth - today + 1);
  const dailyTarget = totalExpenseRemaining > 0 ? totalExpenseRemaining / daysRemaining : 0;

  useEffect(() => {
    Promise.all([fetchBudgets(), fetchExpenses(), fetchIncome()])
  }, [])

  const fetchExpenses = async () => {
    const fetchedExpenses = await ExpenseService.getExpenses()
    setExpenses(fetchedExpenses)
  }

  const fetchIncome = async () => {
    try {
      const fetchedIncome = await IncomeService.getIncome()
      setIncome(fetchedIncome)
    } catch (error) {
      console.error("Error fetching income:", error)
      toast({
        title: "Error",
        description: "Failed to load income data. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  const getProgressColor = (status: string, isIncome: boolean, percentComplete: number) => {
    if (isIncome) {
      if (percentComplete >= 100) {
        return "bg-blue-700"
      }
      switch (status) {
        case "complete":
          return "bg-blue-700"
        case "on-track":
          return "bg-blue-500"
        case "approaching":
          return "bg-blue-600"
        case "exceeded":
          return "bg-blue-700"
        default:
          return "bg-blue-500"
      }
    } else {
      if (percentComplete >= 100) {
        return "bg-red-500"
      }
      switch (status) {
        case "complete":
          return "bg-yellow-600"
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
  }

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalExpenseBudget, userCurrency)}</div>
            <p className="text-xs text-muted-foreground">For current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalExpenseSpent, userCurrency)}</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${totalExpenseBudget > 0 ? (totalExpenseSpent / totalExpenseBudget) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalExpenseBudget > 0 ? Math.round((totalExpenseSpent / totalExpenseBudget) * 100) : 0}% of expense budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalIncomeReceived, userCurrency)}</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${totalIncomeBudget > 0 ? (totalIncomeReceived / totalIncomeBudget) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {totalIncomeBudget > 0 ? Math.round((totalIncomeReceived / totalIncomeBudget) * 100) : 0}% of income goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoney(netCashflow, userCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income minus expenses
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
          <TabsTrigger value="monthly">All Budgets</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="savings">Savings Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">Loading budgets...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {processedBudgets.filter(budget => budget.period === 'monthly').map((budget) => (
                <Card key={budget.id} className={budget.is_income ? "border-blue-200" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{budget.icon}</span> {budget.budget_name || 'Uncategorized'}
                        {budget.is_income && (
                          <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                            Income
                          </Badge>
                        )}
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
                      {budget.is_income ? (
                        <>Received {formatMoney(budget.spent || 0, userCurrency)} of {formatMoney(budget.amount, userCurrency)}</>
                      ) : (
                        <>Spent {formatMoney(budget.spent || 0, userCurrency)} of {formatMoney(budget.amount, userCurrency)}</>
                      )}
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
                        indicatorClassName={getProgressColor(
                          budget.status || 'default', 
                          budget.is_income, 
                          budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
                        )}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>{budget.is_income ? "Remaining Goal" : "Remaining"}</span>
                        <span className={(budget.remaining || 0) < 0 ? (budget.is_income ? "text-green-500 font-medium" : "text-red-500 font-medium") : ""}>
                          {formatMoney(budget.remaining || 0, userCurrency)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1">
                    {budget.is_income ? (
                      <>
                        {budget.status === "on-track" && (
                          <Badge variant="outline" className="w-full justify-center text-blue-500 border-blue-500 gap-1">
                            <TrendingUp className="h-3 w-3" /> In Progress
                          </Badge>
                        )}
                        {budget.status === "approaching" && (
                          <Badge variant="outline" className="w-full justify-center text-blue-600 border-blue-600 gap-1">
                            <TrendingUp className="h-3 w-3" /> Almost There
                          </Badge>
                        )}
                        {budget.status === "complete" && (
                          <Badge variant="outline" className="w-full justify-center text-blue-700 border-blue-700 gap-1">
                            <Check className="h-3 w-3" /> Goal Complete
                          </Badge>
                        )}
                        {budget.status === "exceeded" && (
                          <Badge variant="outline" className="w-full justify-center text-blue-700 border-blue-700 gap-1">
                            <Check className="h-3 w-3" /> Goal Achieved
                          </Badge>
                        )}
                        {budget.amount > 0 && ((budget.spent || 0) / budget.amount) === 1 && !budget.status && (
                          <Badge variant="outline" className="w-full justify-center text-blue-700 border-blue-700 gap-1">
                            <Check className="h-3 w-3" /> Complete
                          </Badge>
                        )}
                      </>
                    ) : (
                      <>
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
                        {budget.status === "complete" && (
                          <Badge variant="outline" className="w-full justify-center text-yellow-600 border-yellow-600 gap-1">
                            <Check className="h-3 w-3" /> Budget Limit
                          </Badge>
                        )}
                        {budget.status === "exceeded" && (
                          <Badge variant="outline" className="w-full justify-center text-red-500 border-red-500 gap-1">
                            <TrendingUp className="h-3 w-3" /> Exceeded
                          </Badge>
                        )}
                        {budget.amount > 0 && ((budget.spent || 0) / budget.amount) === 1 && !budget.status && (
                          <Badge variant="outline" className="w-full justify-center text-yellow-600 border-yellow-600 gap-1">
                            <Check className="h-3 w-3" /> Limit Reached
                          </Badge>
                        )}
                      </>
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

        <TabsContent value="expenses" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">Loading budgets...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {processedBudgets.filter(budget => budget.period === 'monthly' && !budget.is_income).map((budget) => (
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
                      Spent {formatMoney(budget.spent || 0, userCurrency)} of {formatMoney(budget.amount, userCurrency)}
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
                        indicatorClassName={getProgressColor(
                          budget.status || 'default', 
                          budget.is_income, 
                          budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
                        )}
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
                    {budget.amount > 0 && ((budget.spent || 0) / budget.amount) === 1 && !budget.status && (
                      <Badge variant="outline" className="w-full justify-center text-yellow-600 border-yellow-600 gap-1">
                        <Check className="h-3 w-3" /> Limit Reached
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
                <h3 className="font-medium text-center">Create New Expense Budget</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-4">Track your spending in a category</p>
                <Button variant="outline" onClick={() => setAddBudgetOpen(true)}>
                  Add Budget
                </Button>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">Loading budgets...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {processedBudgets.filter(budget => budget.period === 'monthly' && budget.is_income).map((budget) => (
                <Card key={budget.id} className="border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{budget.icon}</span> {budget.budget_name || 'Uncategorized'}
                        <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                          Income
                        </Badge>
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
                      Received {formatMoney(budget.spent || 0, userCurrency)} of {formatMoney(budget.amount, userCurrency)}
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
                        indicatorClassName={getProgressColor(
                          budget.status || 'default', 
                          budget.is_income, 
                          budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
                        )}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span>Remaining Goal</span>
                        <span className={(budget.remaining || 0) < 0 ? "text-green-500 font-medium" : ""}>
                          {formatMoney(budget.remaining || 0, userCurrency)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1">
                    {budget.status === "on-track" && (
                      <Badge variant="outline" className="w-full justify-center text-blue-500 border-blue-500 gap-1">
                        <TrendingUp className="h-3 w-3" /> In Progress
                      </Badge>
                    )}
                    {budget.status === "approaching" && (
                      <Badge variant="outline" className="w-full justify-center text-blue-600 border-blue-600 gap-1">
                        <TrendingUp className="h-3 w-3" /> Almost There
                      </Badge>
                    )}
                    {budget.status === "complete" && (
                      <Badge variant="outline" className="w-full justify-center text-blue-700 border-blue-700 gap-1">
                        <Check className="h-3 w-3" /> Goal Complete
                      </Badge>
                    )}
                    {budget.status === "exceeded" && (
                      <Badge variant="outline" className="w-full justify-center text-blue-700 border-blue-700 gap-1">
                        <Check className="h-3 w-3" /> Goal Achieved
                      </Badge>
                    )}
                    {budget.amount > 0 && ((budget.spent || 0) / budget.amount) === 1 && !budget.status && (
                      <Badge variant="outline" className="w-full justify-center text-blue-700 border-blue-700 gap-1">
                        <Check className="h-3 w-3" /> Complete
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
              <Card className="flex flex-col items-center justify-center p-6 border-dashed border-blue-200">
                <Plus className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-center">Create New Income Budget</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-4">Set income targets for a category</p>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => setAddBudgetOpen(true)}>
                  Add Income Budget
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
