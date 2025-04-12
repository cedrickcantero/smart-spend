"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DBRecurringBill } from "@/types/supabase"
import { RecurringService } from "@/app/api/recurring/service"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { DateRange } from "react-day-picker"
import { AddRecurringModal } from "@/components/recurring/modals/add-recurring-modal"
import { EditRecurringModal } from "@/components/recurring/modals/edit-recurring-modal"
import { DeleteRecurringModal } from "@/components/recurring/modals/delete-recurring-modal"

export default function RecurringPage() {
  const [recurringExpenses, setRecurringExpenses] = useState<DBRecurringBill[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [openAddRecurringExpenseModal, setOpenAddRecurringExpenseModal] = useState(false)
  const [openEditRecurringExpenseModal, setOpenEditRecurringExpenseModal] = useState(false)
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<DBRecurringBill | null>(null)
  const [openDeleteRecurringExpenseModal, setOpenDeleteRecurringExpenseModal] = useState(false)
  const [selectedRecurringExpenseDelete, setSelectedRecurringExpenseDelete] = useState<DBRecurringBill | null>(null)

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      const recurringExpenses = await RecurringService.getRecurringExpenses();
      setRecurringExpenses(recurringExpenses);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    }
  }, [])

  useEffect(() => {
    fetchRecurringExpenses();
  }, [fetchRecurringExpenses])

  const handleAddRecurringClick = useCallback(() => {
    setOpenAddRecurringExpenseModal(true);
  }, [])

  const handleEditRecurringExpense = useCallback((expense: DBRecurringBill) => {
    setSelectedRecurringExpense(expense);
    setOpenEditRecurringExpenseModal(true);
  }, [])

  const handleDeleteRecurringExpense = useCallback((expense: DBRecurringBill) => {
    setSelectedRecurringExpenseDelete(expense);
    setOpenDeleteRecurringExpenseModal(true);
  }, [])

  const handlePaymentMethodChange = useCallback((value: string) => {
    setSelectedPaymentMethod(value);
  }, [])

  const handleDateRangeChange = useCallback((value: DateRange | null) => {
    setDateRange(value);
  }, [])

  const paymentMethodOptions = useMemo(() => {
    const uniquePaymentMethods = Array.from(
      new Set(
        recurringExpenses
          .map(expense => expense.payment_method)
          .filter(Boolean) as string[]
      )
    );
    
    return uniquePaymentMethods.map(method => ({
      label: method,
      value: method,
    }));
  }, [recurringExpenses])

  const recurringColumns = useMemo(() => [
    {
      key: "name",
      label: "Name",
      type: "text" as const,
    },
    {
      key: "payment_method",
      label: "Payment Method",
      type: "text" as const,
    },
    {
      key: "frequency",
      label: "Frequency",
      type: "text" as const,
    },
    {
      key: "due_day",
      label: "Due Day",
      type: "text" as const,
    },
    {
      key: "next_due_date",
      label: "Next Due Date",
      type: "date" as const,
    },
    {
      key: "amount",
      label: "Amount",
      type: "money" as const,
    },
  ], [])

  const getRowActions = useMemo(() => {
    return (row: DBRecurringBill) => [
      {
        label: "Edit",
        onClick: () => handleEditRecurringExpense(row),
      },
      {
        label: "Delete",
        onClick: () => handleDeleteRecurringExpense(row),
      }
    ];
  }, [handleEditRecurringExpense, handleDeleteRecurringExpense])

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <div className="pb-2">
                <h2 className="text-2xl font-semibold">Recurring Expenses</h2>
                <p className="text-sm text-muted-foreground">Manage your recurring expenses</p>
              </div>
              <div>
                <div className="rounded-md border p-4">
                  <CustomDataTable
                    data={recurringExpenses}
                    columns={recurringColumns}
                    actions={getRowActions}
                    title="Expenses"
                    searchField={{
                      field: "name",
                      type: "string",
                    }}
                    addButton={{
                      label: "Add Recurring Expense",
                      onClick: handleAddRecurringClick,
                    }}
                    filters={[
                      {
                        key: "payment_method",
                        label: "Payment Method",
                        type: "select",
                        options: paymentMethodOptions,
                        value: selectedPaymentMethod || "",
                        onChange: handlePaymentMethodChange,
                      },
                      {
                        key: "next_due_date",
                        label: "Date",
                        type: "dateRange",
                        value: dateRange,
                        dateRangeOnChange: handleDateRangeChange,
                      }
                    ]}
                    pagination={{
                      itemsPerPage: 10,
                      itemsPerPageOptions: [5, 10, 20, 50],
                    }}
                  />
                </div>
              </div>
            </div>
        </div>
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
