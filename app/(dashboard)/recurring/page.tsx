"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DBRecurringBill } from "@/types/supabase"
import { RecurringService } from "@/app/api/recurring/service"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { DateRange } from "react-day-picker"
import { AddRecurringModal } from "@/components/recurring/modals/add-recurring-modal"
import { EditRecurringModal } from "@/components/recurring/modals/edit-recurring-modal"
import { DeleteRecurringModal } from "@/components/recurring/modals/delete-recurring-modal"
export default function ExpensesPage() {
  const [recurringExpenses, setRecurringExpenses] = useState<DBRecurringBill[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [openAddRecurringExpenseModal, setOpenAddRecurringExpenseModal] = useState(false)
  const [openEditRecurringExpenseModal, setOpenEditRecurringExpenseModal] = useState(false)
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<DBRecurringBill | null>(null)
  const [openDeleteRecurringExpenseModal, setOpenDeleteRecurringExpenseModal] = useState(false)
  const [selectedRecurringExpenseDelete, setSelectedRecurringExpenseDelete] = useState<DBRecurringBill | null>(null)

  const fetchRecurringExpenses = async () => {
    const recurringExpenses = await RecurringService.getRecurringExpenses();
    setRecurringExpenses(recurringExpenses);
  }

  useEffect(() => {
    Promise.all([ fetchRecurringExpenses()]);
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring</h1>
      </div>
      <Tabs defaultValue="recurring" className="w-full">
        <TabsList>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 mt-4">
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
                          setSelectedRecurringExpense(row)
                          setOpenEditRecurringExpenseModal(true)
                        },
                      },
                      {
                        label: "Delete",
                        onClick: () => {
                          setSelectedRecurringExpenseDelete(row)
                          setOpenDeleteRecurringExpenseModal(true)
                        },
                      }
                    ]}
                    title="Expenses"
                    searchField={{
                      field: "name",
                      type: "string",
                    }}
                    addButton={
                      {
                        label: "Add Recurring Expense",
                        onClick: () => setOpenAddRecurringExpenseModal(true),
                      }
                    }
                    filters={[
                      {
                        key: "payment_method",
                        label: "Payment Method",
                        type: "select",
                        options: recurringExpenses.map((expense) => ({
                          label: expense.payment_method || "",
                          value: expense.payment_method || "",
                        })),
                        value: selectedPaymentMethod || "",
                        onChange: (value) => setSelectedPaymentMethod(value),
                      },
                      {
                        key: "next_due_date",
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
        </div>
      </Tabs>
      {openAddRecurringExpenseModal && (
        <AddRecurringModal
          open={openAddRecurringExpenseModal}
          onOpenChange={setOpenAddRecurringExpenseModal}
          fetchRecurringExpenses={fetchRecurringExpenses}
        />
      )}
      {selectedRecurringExpense && (
        <EditRecurringModal
          open={openEditRecurringExpenseModal}
          onOpenChange={setOpenEditRecurringExpenseModal}
          fetchRecurringExpenses={fetchRecurringExpenses}
          recurring={selectedRecurringExpense}
        />
      )}
      {selectedRecurringExpenseDelete && (
        <DeleteRecurringModal
          open={openDeleteRecurringExpenseModal}
          onOpenChange={setOpenDeleteRecurringExpenseModal}
          fetchRecurringExpenses={fetchRecurringExpenses}
          recurringExpense={selectedRecurringExpenseDelete}
        />
      )}
    </div>
  )
}
