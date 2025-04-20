"use client"

import { useCallback, useMemo, useState } from "react"
import { DBExpense } from "@/types/supabase"
import { DateRange } from "react-day-picker"
import { AddExpenseModal } from "@/components/expense/modals/add-expense-modal"
import { EditExpenseModal } from "@/components/expense/modals/edit-expense-modal"
import { DeleteExpenseModal } from "@/components/expense/modals/delete-expense-modal"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { useExpenses } from "@/app/contexts/ExpenseContext"
import { useCategories } from "@/app/contexts/CategoriesContext"

export default function ExpensesPage() {
  const { expenses, loading, refreshExpenses, filterExpensesByCategory, filterExpensesByDateRange } = useExpenses()
  const { categories } = useCategories()
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false)
  const [openEditExpenseModal, setOpenEditExpenseModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<DBExpense | null>(null)
  const [openDeleteExpenseModal, setOpenDeleteExpenseModal] = useState(false)
  const [selectedExpenseToDelete, setSelectedExpenseToDelete] = useState<DBExpense | null>(null)

  // Filter expenses based on selected filters
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(expense => expense.category_id === selectedCategory);
    }
    
    // Apply date range filter
    if (dateRange && dateRange.from) {
      const startDate = dateRange.from;
      const endDate = dateRange.to || startDate;
      
      result = result.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }
    
    return result;
  }, [expenses, selectedCategory, dateRange]);

  const handleDeleteExpense = useCallback((expense: DBExpense) => {
    setSelectedExpenseToDelete(expense)
    setOpenDeleteExpenseModal(true)
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, [])

  const handleDateRangeChange = useCallback((value: DateRange | null) => {
    setDateRange(value);
  }, [])

  const handleAddExpenseClick = useCallback(() => {
    setOpenAddExpenseModal(true);
  }, [])

  const handleEditExpenseClick = useCallback((row: DBExpense) => {
    setSelectedExpense(row);
    setOpenEditExpenseModal(true);
  }, [])

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }, [categories])

  const expenseColumns = useMemo(() => [
    {
      key: "date",
      label: "Date",
      type: "date" as const,
    },
    {
      key: "merchant",
      label: "Merchant",
      type: "text" as const,
    },
    {
      key: "payment_method",
      label: "Payment Method",
      type: "text" as const,
    },
    {
      key: "amount",
      label: "Amount",
      type: "money" as const,
    }
  ], [])

  const getRowActions = useCallback((row: DBExpense) => [
    {
      label: "Edit",
      onClick: () => handleEditExpenseClick(row),
    },
    {
      label: "Delete",
      onClick: () => handleDeleteExpense(row),
    }
  ], [handleEditExpenseClick, handleDeleteExpense])

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <div className="pb-2">
                <h2 className="text-2xl font-semibold">Expenses</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredExpenses.length} expenses found
                  {selectedCategory && categories.find(c => c.id === selectedCategory) && 
                    ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>
              <div>
                <div className="rounded-md border p-4">
                  <CustomDataTable
                    data={filteredExpenses}
                    columns={expenseColumns}
                    actions={getRowActions}
                    title="Expenses"
                    searchField={{
                      field: "merchant",
                      type: "string",
                    }}
                    addButton={{
                      label: "Add Expense",
                      onClick: handleAddExpenseClick,
                    }}
                    filters={[
                      {
                        key: "category",
                        label: "Category",
                        type: "select",
                        options: categoryOptions,
                        value: selectedCategory || "",
                        onChange: handleCategoryChange,
                      },
                      {
                        key: "date",
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
      {openAddExpenseModal && categories.length > 0 && (
        <AddExpenseModal 
          open={openAddExpenseModal} 
          onOpenChange={setOpenAddExpenseModal} 
          categories={categories}
          fetchExpenses={refreshExpenses}
        />
      )}
      {selectedExpense && categories.length > 0 && (
        <EditExpenseModal 
          open={openEditExpenseModal} 
          onOpenChange={setOpenEditExpenseModal} 
          expense={selectedExpense}
          categories={categories}
          fetchExpenses={refreshExpenses}
        />
      )}
      {selectedExpenseToDelete && categories.length > 0 && (
        <DeleteExpenseModal
          open={openDeleteExpenseModal}
          onOpenChange={setOpenDeleteExpenseModal}
          expense={selectedExpenseToDelete}
          fetchExpenses={refreshExpenses}
        />
      )}
    </div>
  )
}
