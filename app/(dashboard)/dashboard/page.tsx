import { DollarSign, Wallet, Gift, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseChart } from "@/components/expense-chart"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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
    </div>
  )
}
