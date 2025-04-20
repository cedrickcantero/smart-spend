"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { DBExpense, DBExpenseInsert } from "@/types/supabase"
import { ExpenseService } from "@/app/api/expense/service"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "./CategoriesContext"

interface ExpenseContextType {
  expenses: DBExpense[]
  loading: boolean
  error: string | null
  refreshExpenses: () => Promise<void>
  getExpenseById: (id: string) => DBExpense | undefined
  addExpense: (expense: DBExpenseInsert) => Promise<DBExpense>
  updateExpense: (expense: DBExpense) => Promise<DBExpense>
  deleteExpense: (id: string) => Promise<void>
  recentExpenses: DBExpense[]
  filterExpensesByCategory: (categoryId: string) => DBExpense[]
  filterExpensesByDateRange: (startDate: Date, endDate: Date) => DBExpense[]
  getTotalExpenses: () => number
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<DBExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categories: _categories } = useCategories()
  
  // Track pending operations for optimistic updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_pendingOperations, setPendingOperations] = useState<{
    [id: string]: "create" | "update" | "delete"
  }>({})

  const refreshExpenses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ExpenseService.getExpenses()
      setExpenses(data)
    } catch (err) {
      console.error("Failed to fetch expenses:", err)
      setError("Failed to load expenses")
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const getExpenseById = (id: string): DBExpense | undefined => {
    return expenses.find(expense => expense.id === id)
  }

  const addExpense = async (expense: DBExpenseInsert): Promise<DBExpense> => {
    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`
      
      // Ensure all required fields are present for the optimistic update
      const optimisticExpense: DBExpense = {
        id: tempId,
        amount: expense.amount,
        merchant: expense.merchant,
        category_id: expense.category_id || null,
        date: expense.date || new Date().toISOString().split('T')[0],
        description: expense.description || null,
        payment_method: expense.payment_method || null,
        is_tax_deductible: expense.is_tax_deductible || false,
        receipt_url: expense.receipt_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "optimistic"
      }
      
      // Optimistically update the UI
      setExpenses(prev => [optimisticExpense, ...prev])
      setPendingOperations(prev => ({ ...prev, [tempId]: "create" }))
      
      // Actual API call
      const newExpense = await ExpenseService.createExpense({
        amount: expense.amount,
        merchant: expense.merchant,
        category_id: expense.category_id ?? null,
        date: expense.date || new Date().toISOString().split('T')[0],
        description: expense.description ?? null,
        payment_method: expense.payment_method ?? null,
        is_tax_deductible: expense.is_tax_deductible ?? false,
        receipt_url: expense.receipt_url ?? null
      })
      
      // Update with real data from server
      setExpenses(prev => 
        prev.map(exp => exp.id === tempId ? newExpense : exp)
      )
      
      // Clear pending operation
      setPendingOperations(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [tempId]: _unused, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Expense added",
        description: "The new expense has been added successfully.",
        variant: "success",
      })
      return newExpense
    } catch (err) {
      console.error("Error adding expense:", err)
      
      // Revert optimistic update on error
      setExpenses(prev => 
        prev.filter(exp => !exp.id.toString().startsWith('temp-'))
      )
      
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateExpense = async (expense: DBExpense): Promise<DBExpense> => {
    try {
      // Store original for potential rollback
      const originalExpense = expenses.find(e => e.id === expense.id)
      if (!originalExpense) throw new Error("Expense not found")
      
      // Optimistically update the UI
      setExpenses(prev => 
        prev.map(exp => exp.id === expense.id ? {
          ...expense,
          updated_at: new Date().toISOString() 
        } : exp)
      )
      setPendingOperations(prev => ({ ...prev, [expense.id]: "update" }))
      
      // Actual API call
      const updatedExpense = await ExpenseService.updateExpense(expense)
      
      // Update with real data from server
      setExpenses(prev => 
        prev.map(exp => exp.id === expense.id ? updatedExpense : exp)
      )
      
      // Clear pending operation
      setPendingOperations(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [expense.id]: _unused, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Expense updated",
        description: "The expense has been updated successfully.",
        variant: "success",
      })
      return updatedExpense
    } catch (err) {
      console.error("Error updating expense:", err)
      
      // Revert optimistic update on error
      const originalExpense = expenses.find(e => e.id === expense.id)
      if (originalExpense) {
        setExpenses(prev => 
          prev.map(exp => exp.id === expense.id ? originalExpense : exp)
        )
      }
      
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteExpense = async (id: string): Promise<void> => {
    try {
      // Store expense for potential rollback
      const expenseToDelete = expenses.find(e => e.id === id)
      if (!expenseToDelete) throw new Error("Expense not found")
      
      // Optimistically update the UI
      setExpenses(prev => prev.filter(exp => exp.id !== id))
      setPendingOperations(prev => ({ ...prev, [id]: "delete" }))
      
      // Actual API call
      await ExpenseService.deleteExpense(id)
      
      // Clear pending operation
      setPendingOperations(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _unused, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Expense deleted",
        description: "The expense has been deleted successfully.",
        variant: "success",
      })
    } catch (err) {
      console.error("Error deleting expense:", err)
      
      // Revert optimistic delete on error
      const expenseToRestore = expenses.find(e => e.id === id)
      if (expenseToRestore) {
        setExpenses(prev => [...prev, expenseToRestore])
      }
      
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
      throw err
    }
  }

  // Get recent expenses (last 30 days)
  const recentExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return expenseDate >= thirtyDaysAgo
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter expenses by category
  const filterExpensesByCategory = (categoryId: string): DBExpense[] => {
    return expenses.filter(expense => expense.category_id === categoryId)
  }

  // Filter expenses by date range
  const filterExpensesByDateRange = (startDate: Date, endDate: Date): DBExpense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= startDate && expenseDate <= endDate
    })
  }

  // Get total expenses
  const getTotalExpenses = (): number => {
    return expenses.reduce((total, expense) => total + Number(expense.amount), 0)
  }

  // Initial fetch
  useEffect(() => {
    refreshExpenses()
  }, [refreshExpenses])

  const value = {
    expenses,
    loading,
    error,
    refreshExpenses,
    getExpenseById,
    addExpense,
    updateExpense,
    deleteExpense,
    recentExpenses,
    filterExpensesByCategory,
    filterExpensesByDateRange,
    getTotalExpenses
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpenses = () => {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider")
  }
  return context
} 