"use client"

import { useEffect, useState } from "react"
import { Calendar, Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DBExpense, DBCategory, DBRecurringBill } from "@/types/supabase"
import { ExpenseService } from "@/app/api/expense/service"
import { CategoriesService } from "@/app/api/categories/service"

import { RecurringService } from "@/app/api/recurring/service"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { DateRange } from "react-day-picker"
import { AddExpenseModal } from "@/components/expense/modals/add-expense-modal"
import { EditExpenseModal } from "@/components/expense/modals/edit-expense-modal"
import { DeleteExpenseModal } from "@/components/expense/modals/delete-expense-modal"

export default function ExpensesPage() {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<DBExpense[]>([])
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [recurringExpenses, setRecurringExpenses] = useState<DBRecurringBill[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false)
  const [openEditExpenseModal, setOpenEditExpenseModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<DBExpense | null>(null)
  const [openDeleteExpenseModal, setOpenDeleteExpenseModal] = useState(false)
  const [selectedExpenseToDelete, setSelectedExpenseToDelete] = useState<DBExpense | null>(null)

  const fetchExpenses = async () => {
    const expenses = await ExpenseService.getExpenses();
    setExpenses(expenses);
  }

  const fetchCategories = async () => {
    const categories = await CategoriesService.getCategories();
    setCategories(categories);
  }

  const fetchRecurringExpenses = async () => {
    const recurringExpenses = await RecurringService.getRecurringExpenses();
    setRecurringExpenses(recurringExpenses);
  }

  useEffect(() => {
    Promise.all([fetchExpenses(), fetchCategories(), fetchRecurringExpenses()]);
  }, [])


  const handleDeleteExpense = (expense: DBExpense) => {
    setSelectedExpenseToDelete(expense)
    setOpenDeleteExpenseModal(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 mt-4">
          <TabsContent value="all" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>
                  {expenses.length} expenses found
                  {selectedCategory && ` in ${selectedCategory}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <CustomDataTable
                    data={expenses}
                    columns={[
                      {
                        key: "date",
                        label: "Date",
                        type: "date",
                      },
                      {
                        key: "merchant",
                        label: "Merchant",
                        type: "text",
                        // render: (value, row) => {
                        //   return (
                        //     <div className="flex items-center gap-2">
                        //       <Avatar className="h-8 w-8">
                        //         <AvatarImage src={row.merchant_logo} />
                        //         <AvatarFallback>{row.merchant.charAt(0)}</AvatarFallback> 
                        //       </Avatar>
                        //       <span className="text-xs text-muted-foreground">{row.merchant}</span>
                        //     </div>
                        //   )
                        // }
                      },
                      {
                        key: "payment_method",
                        label: "Payment Method",
                        type: "text",
                      },
                      {
                        key: "amount",
                        label: "Amount",
                        type: "money",
                      }
                    ]}
                    actions={(row) => [
                      {
                        label: "Edit",
                        onClick: () => {
                          setSelectedExpense(row)
                          setOpenEditExpenseModal(true)
                        },
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDeleteExpense(row),
                      }
                    ]}
                    title="Expenses"
                    searchField={{
                      field: "merchant",
                      type: "string",
                    }}
                    addButton={
                      {
                        label: "Add Expense",
                        onClick: () => setOpenAddExpenseModal(true),
                      }
                    }
                    filters={[
                      {
                        key: "category",
                        label: "Category",
                        type: "select",
                        options: categories.map((category) => ({
                          label: category.name,
                          value: category.id,
                        })),
                        value: selectedCategory || "",
                        onChange: (value) => setSelectedCategory(value),
                      },
                      {
                        key: "date",
                        label: "Date",
                        type: "dateRange",
                        value: dateRange,
                        dateRangeOnChange: (value) => setDateRange(value),
                      }
                    ]}
                    pagination={{
                      itemsPerPage: 10,
                      itemsPerPageOptions: [5, 10, 20, 50],
                    }}
                  />
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
              <div className="rounded-md border">
                  <CustomDataTable
                    data={recurringExpenses}
                    columns={[
                      {
                        key: "name",
                        label: "Name",
                        type: "text",
                      },
                      {
                        key: "payment_method",
                        label: "Payment Method",
                        type: "text",
                      },
                      {
                        key: "frequency",
                        label: "Frequency",
                        type: "text",
                      },
                      {
                        key: "due_day",
                        label: "Due Day",
                        type: "text",
                      },
                      {
                        key: "next_due_date",
                        label: "Next Due Date",
                        type: "date",
                      },
                      {
                        key: "amount",
                        label: "Amount",
                        type: "money",
                      },
                    ]}
                    actions={(row) => [
                      {
                        label: "Edit",
                        onClick: () => {
                          setSelectedExpense(row)
                          setOpenEditExpenseModal(true)
                        },
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDeleteExpense(row),
                      }
                    ]}
                    title="Expenses"
                    searchField={{
                      field: "merchant",
                      type: "string",
                    }}
                    addButton={
                      {
                        label: "Add Expense",
                        onClick: () => setOpenAddExpenseModal(true),
                      }
                    }
                    filters={[
                      {
                        key: "category",
                        label: "Category",
                        type: "select",
                        options: categories.map((category) => ({
                          label: category.name,
                          value: category.id,
                        })),
                        value: selectedCategory || "",
                        onChange: (value) => setSelectedCategory(value),
                      },
                      {
                        key: "date",
                        label: "Date",
                        type: "dateRange",
                        value: dateRange,
                        dateRangeOnChange: (value) => setDateRange(value),
                      }
                    ]}
                    pagination={{
                      itemsPerPage: 10,
                      itemsPerPageOptions: [5, 10, 20, 50],
                    }}
                  />
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
      {categories.length > 0 && (
        <AddExpenseModal 
          open={openAddExpenseModal} 
          onOpenChange={setOpenAddExpenseModal} 
          categories={categories}
          fetchExpenses={fetchExpenses}
        />
      )}
      {selectedExpense && categories.length > 0 && (
        <EditExpenseModal 
          open={openEditExpenseModal} 
          onOpenChange={setOpenEditExpenseModal} 
          expense={selectedExpense}
          categories={categories}
          fetchExpenses={fetchExpenses}
        />
      )}
      {selectedExpenseToDelete && categories.length > 0 && (
        <DeleteExpenseModal
          open={openDeleteExpenseModal}
          onOpenChange={setOpenDeleteExpenseModal}
          expense={selectedExpenseToDelete}
          fetchExpenses={fetchExpenses}
        />
      )}
    </div>
  )
}
