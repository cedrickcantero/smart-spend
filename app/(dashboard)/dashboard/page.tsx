"use client"

import { DollarSign, Wallet, Gift, FileText, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseChart } from "@/components/expense-chart"
import { useAuth } from "@/lib/auth-context"
import { DashboardService } from "@/app/api/dashboard/service"
import { useState, useEffect, useCallback } from "react"
import { DashboardData } from "@/lib/services/dashboard-service"
import { formatMoney } from "@/lib/utils"
import { UserSettings } from "@/types/userSettings"
import { toast } from "@/hooks/use-toast"
import { AIInsights } from "@/components/dashboard/ai-insights"

export default function DashboardPage() {
  const { user, userSettings: dbUserSettings } = useAuth()
  const userSettings = dbUserSettings as unknown as UserSettings
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [showAiInsights, setShowAiInsights] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    if (user) {
      try {
        const response = await DashboardService.getDashboardData()
        setDashboardData(response)
      } catch (error) {
        const err = error as Error;

        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        })
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])


  useEffect(() => {
    if (userSettings?.dashboard?.showAIInsights) {
      setShowAiInsights(true)
    }
  }, [userSettings])


  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(dashboardData?.totalIncome?.amount || 0, userSettings?.preferences?.currency as unknown as string || 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {!dashboardData?.totalIncome ? 'No data' :
               dashboardData.totalIncome.percentChange === 0 ? 'No change' : 
               `${dashboardData.totalIncome.percentChange > 0 ? '+' : ''}${dashboardData.totalIncome.percentChange}% from last month`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(dashboardData?.totalExpenses?.amount || 0, userSettings?.preferences?.currency as unknown as string || 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {!dashboardData?.totalExpenses ? 'No data' :
               dashboardData.totalExpenses.percentChange === 0 ? 'No change' : 
               `${dashboardData.totalExpenses.percentChange > 0 ? '+' : ''}${dashboardData.totalExpenses.percentChange}% from last month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(dashboardData?.monthlyBudget?.amount || 0, userSettings?.preferences?.currency as unknown as string || 'USD')}</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div className="h-full w-[60%] rounded-full bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              {!dashboardData?.monthlyBudget ? 'No data' :
               dashboardData.monthlyBudget.percentage === 0 ? 'No change' : 
               `${dashboardData.monthlyBudget.percentage > 0 ? '+' : ''}${dashboardData.monthlyBudget.percentage}% from last month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(dashboardData?.savingsGoal?.target || 0, userSettings?.preferences?.currency as unknown as string || 'USD')}</div>
            <div className="mt-1 h-2 w-full rounded-full bg-muted">
              <div className="h-full w-[45%] rounded-full bg-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              {!dashboardData?.savingsGoal ? 'No data' :
               dashboardData.savingsGoal.percentage === 0 ? 'No change' : 
               `${dashboardData.savingsGoal.percentage > 0 ? '+' : ''}${dashboardData.savingsGoal.percentage}% from last month`}
            </p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(dashboardData?.taxDeductions?.amount || 0, userSettings?.preferences?.currency as unknown as string || 'USD')}</div>
            <p className="text-xs text-muted-foreground">Potential tax savings this year</p>
          </CardContent>
        </Card> */}
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ExpenseChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                Detailed analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                AI-powered insights will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {showAiInsights && <AIInsights />}
    </div>
  )
}
