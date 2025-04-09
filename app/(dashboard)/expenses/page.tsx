"use client"

import { useState } from "react"
import { Calendar, Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock expense data
const expenses = [
  {
    id: "EXP-001",
    date: "2023-04-23",
    merchant: "Starbucks Coffee",
    category: "Food & Dining",
    amount: 4.5,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "EXP-002",
    date: "2023-04-22",
    merchant: "Amazon.com",
    category: "Shopping",
    amount: 29.99,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "EXP-003",
    date: "2023-04-20",
    merchant: "Rent Payment",
    category: "Housing",
    amount: 1200.0,
    status: "Completed",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP-004",
    date: "2023-04-19",
    merchant: "Chipotle",
    category: "Food & Dining",
    amount: 12.48,
    status: "Completed",
    paymentMethod: "Debit Card",
  },
  {
    id: "EXP-005",
    date: "2023-04-18",
    merchant: "Gas Station",
    category: "Transportation",
    amount: 45.23,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "EXP-006",
    date: "2023-04-15",
    merchant: "Netflix Subscription",
    category: "Entertainment",
    amount: 14.99,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "EXP-007",
    date: "2023-04-14",
    merchant: "Grocery Store",
    category: "Groceries",
    amount: 87.32,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "EXP-008",
    date: "2023-04-10",
    merchant: "Pharmacy",
    category: "Health",
    amount: 32.5,
    status: "Completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "EXP-009",
    date: "2023-04-08",
    merchant: "Gym Membership",
    category: "Health",
    amount: 50.0,
    status: "Pending",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "EXP-010",
    date: "2023-04-05",
    merchant: "Electric Bill",
    category: "Utilities",
    amount: 85.42,
    status: "Completed",
    paymentMethod: "Bank Transfer",
  },
]

// Category icons mapping
const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍔",
  Shopping: "🛍️",
  Housing: "🏠",
  Transportation: "🚗",
  Entertainment: "🎬",
  Groceries: "🛒",
  Health: "💊",
  Utilities: "💡",
}

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter expenses based on search term and category
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      searchTerm === "" ||
      expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === null || expense.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Food & Dining")}>
                    Food & Dining
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Shopping")}>Shopping</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Housing")}>Housing</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Transportation")}>
                    Transportation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Entertainment")}>
                    Entertainment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Groceries")}>Groceries</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Health")}>Health</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory("Utilities")}>Utilities</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>This month</DropdownMenuItem>
                  <DropdownMenuItem>Last month</DropdownMenuItem>
                  <DropdownMenuItem>Custom range</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} expenses found
                  {selectedCategory && ` in ${selectedCategory}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.id}</TableCell>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                                <AvatarFallback>{expense.merchant[0]}</AvatarFallback>
                              </Avatar>
                              {expense.merchant}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {categoryIcons[expense.category] || "🏷️"} {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={expense.status === "Completed" ? "default" : "secondary"}
                              className="font-normal"
                            >
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <SlidersHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Expenses</CardTitle>
                <CardDescription>Manage your recurring expenses and subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  No recurring expenses found. Add a recurring expense to see it here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Manage your subscription expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Billing Cycle</TableHead>
                        <TableHead>Next Billing</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>N</AvatarFallback>
                            </Avatar>
                            Netflix
                          </div>
                        </TableCell>
                        <TableCell>Monthly</TableCell>
                        <TableCell>May 15, 2023</TableCell>
                        <TableCell className="text-right font-medium">$14.99</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            Spotify
                          </div>
                        </TableCell>
                        <TableCell>Monthly</TableCell>
                        <TableCell>May 10, 2023</TableCell>
                        <TableCell className="text-right font-medium">$9.99</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>G</AvatarFallback>
                            </Avatar>
                            Gym Membership
                          </div>
                        </TableCell>
                        <TableCell>Monthly</TableCell>
                        <TableCell>May 8, 2023</TableCell>
                        <TableCell className="text-right font-medium">$50.00</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
