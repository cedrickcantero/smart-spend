"use client"

import { useState } from "react"
import { ArrowDown, ArrowRight, Calendar, Download, FileText, Filter, Printer, Receipt, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

// Mock tax deduction data
const taxDeductions = [
  {
    id: 1,
    category: "Home Office",
    amount: 1200.0,
    description: "Dedicated home office space (20% of rent)",
    date: "2023-01-15",
    status: "eligible",
  },
  {
    id: 2,
    category: "Business Travel",
    amount: 850.5,
    description: "Flight and hotel for industry conference",
    date: "2023-02-22",
    status: "eligible",
  },
  {
    id: 3,
    category: "Office Supplies",
    amount: 320.75,
    description: "Computer accessories and stationery",
    date: "2023-03-10",
    status: "eligible",
  },
  {
    id: 4,
    category: "Professional Development",
    amount: 499.0,
    description: "Online course subscription",
    date: "2023-03-15",
    status: "eligible",
  },
  {
    id: 5,
    category: "Software Subscriptions",
    amount: 240.0,
    description: "Design and productivity software",
    date: "2023-04-05",
    status: "eligible",
  },
  {
    id: 6,
    category: "Meals & Entertainment",
    amount: 180.0,
    description: "Business lunch with clients",
    date: "2023-04-12",
    status: "partial",
    eligibleAmount: 90.0,
  },
  {
    id: 7,
    category: "Personal Purchase",
    amount: 150.0,
    description: "Personal items",
    date: "2023-04-18",
    status: "ineligible",
  },
]

// Calculate total deductions
const totalEligibleDeductions = taxDeductions
  .filter((item) => item.status === "eligible")
  .reduce((sum, item) => sum + item.amount, 0)

const totalPartialDeductions = taxDeductions
  .filter((item) => item.status === "partial")
  .reduce((sum, item) => sum + (item.eligibleAmount || 0), 0)

const totalDeductions = totalEligibleDeductions + totalPartialDeductions

// Mock tax categories
const taxCategories = [
  { name: "Home Office", amount: 1200.0, color: "bg-blue-500" },
  { name: "Business Travel", amount: 850.5, color: "bg-green-500" },
  { name: "Office Supplies", amount: 320.75, color: "bg-yellow-500" },
  { name: "Professional Development", amount: 499.0, color: "bg-purple-500" },
  { name: "Software Subscriptions", amount: 240.0, color: "bg-pink-500" },
  { name: "Meals & Entertainment", amount: 90.0, color: "bg-orange-500" },
]

export default function TaxReportsPage() {
  const [taxYear, setTaxYear] = useState("2023")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tax Reports</h1>
        <div className="flex gap-2">
          <Select defaultValue={taxYear} onValueChange={setTaxYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tax Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" className="gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDeductions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Potential tax savings for {taxYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22%</div>
            <p className="text-xs text-muted-foreground">Estimated marginal tax rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Savings</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalDeductions * 0.22).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Based on your tax rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deductible Items</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taxDeductions.filter((item) => item.status !== "ineligible").length}
            </div>
            <p className="text-xs text-muted-foreground">Out of {taxDeductions.length} total expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deductions" className="w-full">
        <TabsList>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="deductions" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Tax Deductions</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>Potential tax deductions for {taxYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxDeductions.map((deduction) => (
                      <TableRow key={deduction.id}>
                        <TableCell className="font-medium">{deduction.category}</TableCell>
                        <TableCell>{deduction.description}</TableCell>
                        <TableCell>{new Date(deduction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {deduction.status === "eligible" && <Badge className="bg-green-500">Eligible</Badge>}
                          {deduction.status === "partial" && <Badge className="bg-yellow-500">Partial</Badge>}
                          {deduction.status === "ineligible" && (
                            <Badge variant="outline" className="text-red-500 border-red-500">
                              Not Eligible
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {deduction.status === "eligible" && (
                            <span className="font-medium">${deduction.amount.toFixed(2)}</span>
                          )}
                          {deduction.status === "partial" && (
                            <span className="font-medium">
                              ${deduction.eligibleAmount?.toFixed(2)}
                              <span className="text-muted-foreground text-xs">
                                {" "}
                                (of ${deduction.amount.toFixed(2)})
                              </span>
                            </span>
                          )}
                          {deduction.status === "ineligible" && (
                            <span className="text-muted-foreground">${deduction.amount.toFixed(2)}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deduction Categories</CardTitle>
              <CardDescription>Breakdown by expense category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {taxCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="font-medium">${category.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(category.amount / totalDeductions) * 100}
                        className="h-2"
                        indicatorClassName={category.color}
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {Math.round((category.amount / totalDeductions) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tax Optimization Tips</CardTitle>
                <CardDescription>Ways to maximize your deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-1">Home Office Deduction</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      You can deduct expenses for the business use of your home if you use part of your home regularly
                      and exclusively for business.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Learn More
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-1">Business Travel</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Keep detailed records of business travel expenses, including transportation, lodging, and meals.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Learn More
                    </Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-1">Professional Development</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Education expenses that maintain or improve skills needed for your current business are
                      deductible.
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowRight className="h-3 w-3" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Calendar</CardTitle>
                <CardDescription>Important tax dates for {taxYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-100 text-red-700 font-medium rounded-md px-3 py-1 text-sm w-24 text-center">
                      Apr 15
                    </div>
                    <div>
                      <h3 className="font-medium">Tax Filing Deadline</h3>
                      <p className="text-sm text-muted-foreground">Individual tax returns due</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 text-yellow-700 font-medium rounded-md px-3 py-1 text-sm w-24 text-center">
                      Jun 15
                    </div>
                    <div>
                      <h3 className="font-medium">Estimated Tax Payment</h3>
                      <p className="text-sm text-muted-foreground">Second quarter estimated taxes due</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 text-yellow-700 font-medium rounded-md px-3 py-1 text-sm w-24 text-center">
                      Sep 15
                    </div>
                    <div>
                      <h3 className="font-medium">Estimated Tax Payment</h3>
                      <p className="text-sm text-muted-foreground">Third quarter estimated taxes due</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 font-medium rounded-md px-3 py-1 text-sm w-24 text-center">
                      Oct 15
                    </div>
                    <div>
                      <h3 className="font-medium">Extended Filing Deadline</h3>
                      <p className="text-sm text-muted-foreground">Extended individual tax returns due</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Management</CardTitle>
              <CardDescription>Organize and store your tax receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10">
                <Receipt className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium text-center">Drag & drop receipt images or click to upload</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">Supports JPG, PNG and PDF files</p>
                <Button className="mt-4">Upload Receipts</Button>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">Recently Uploaded Receipts</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="border rounded-md p-3">
                    <div className="aspect-[4/3] bg-muted rounded-md flex items-center justify-center mb-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Office Supplies</h4>
                        <p className="text-xs text-muted-foreground">Apr 10, 2023</p>
                      </div>
                      <Badge className="bg-green-500">$320.75</Badge>
                    </div>
                  </div>

                  <div className="border rounded-md p-3">
                    <div className="aspect-[4/3] bg-muted rounded-md flex items-center justify-center mb-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Software Subscription</h4>
                        <p className="text-xs text-muted-foreground">Apr 5, 2023</p>
                      </div>
                      <Badge className="bg-green-500">$240.00</Badge>
                    </div>
                  </div>

                  <div className="border rounded-md p-3">
                    <div className="aspect-[4/3] bg-muted rounded-md flex items-center justify-center mb-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Business Lunch</h4>
                        <p className="text-xs text-muted-foreground">Apr 12, 2023</p>
                      </div>
                      <Badge className="bg-yellow-500">$90.00</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tax Reports</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
              <CardDescription>Generate and download tax reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">Annual Expense Summary</h3>
                        <p className="text-sm text-muted-foreground">Complete summary of all expenses for {taxYear}</p>
                      </div>
                    </div>
                    <Button>Generate</Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">Tax Deduction Report</h3>
                        <p className="text-sm text-muted-foreground">Detailed report of all eligible tax deductions</p>
                      </div>
                    </div>
                    <Button>Generate</Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">Quarterly Tax Summary</h3>
                        <p className="text-sm text-muted-foreground">Breakdown of expenses by quarter</p>
                      </div>
                    </div>
                    <Button>Generate</Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">Receipt Collection</h3>
                        <p className="text-sm text-muted-foreground">Compilation of all receipt images</p>
                      </div>
                    </div>
                    <Button>Generate</Button>
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
