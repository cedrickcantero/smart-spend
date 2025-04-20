"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { DBBudget, DBBudgetInsert } from "@/types/supabase"
import { BudgetService } from "@/app/api/budget/service"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "./CategoriesContext"

interface BudgetContextType {
  budgets: DBBudget[]
  loading: boolean
  error: string | null
  refreshBudgets: () => Promise<void>
  getBudgetById: (id: string) => DBBudget | undefined
  getBudgetByCategory: (categoryId: string) => DBBudget | undefined
  addBudget: (budget: DBBudgetInsert) => Promise<DBBudget>
  updateBudget: (budget: DBBudget) => Promise<DBBudget>
  deleteBudget: (id: string) => Promise<void>
  filterBudgetsByPeriod: (period: string) => DBBudget[]
  getTotalAllocated: () => number
  getTotalSpent: () => number
  getTotalRemaining: () => number
  getBudgetSummary: () => {
    totalAllocated: number
    totalSpent: number
    totalRemaining: number
    percentUsed: number
  }
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<DBBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { categories } = useCategories()
  
  // Track pending operations for optimistic updates
  const [pendingOperations, setPendingOperations] = useState<{
    [id: string]: "create" | "update" | "delete"
  }>({})

  const refreshBudgets = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await BudgetService.getBudgets()
      setBudgets(data)
    } catch (err) {
      console.error("Failed to fetch budgets:", err)
      setError("Failed to load budgets")
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getBudgetById = (id: string): DBBudget | undefined => {
    return budgets.find(budget => budget.id === id)
  }

  const getBudgetByCategory = (categoryId: string): DBBudget | undefined => {
    return budgets.find(budget => budget.category_id === categoryId)
  }

  const addBudget = async (budget: DBBudgetInsert): Promise<DBBudget> => {
    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`
      
      // Ensure all required fields are present for the optimistic update
      const optimisticBudget: DBBudget = {
        id: tempId,
        amount: budget.amount,
        budget_name: budget.budget_name || '',
        category_id: budget.category_id || '',
        period: budget.period || 'monthly',
        is_income: budget.is_income || false,
        start_date: budget.start_date || new Date().toISOString().split('T')[0],
        end_date: budget.end_date || null,
        spent: 0,
        remaining: budget.amount,
        status: 'on-track',
        icon: budget.icon || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "optimistic"
      }
      
      // Optimistically update the UI
      setBudgets(prev => [optimisticBudget, ...prev])
      setPendingOperations(prev => ({ ...prev, [tempId]: "create" }))
      
      // Actual API call
      const newBudget = await BudgetService.createBudget({
        amount: budget.amount,
        budget_name: budget.budget_name || '',
        category_id: budget.category_id || '',
        period: budget.period || 'monthly',
        is_income: budget.is_income || false,
        start_date: budget.start_date || new Date().toISOString().split('T')[0],
        end_date: budget.end_date || null,
        icon: budget.icon || null
      })
      
      // Update with real data from server
      setBudgets(prev => 
        prev.map(bdg => bdg.id === tempId ? newBudget : bdg)
      )
      
      // Clear pending operation
      setPendingOperations(prev => {
        const { [tempId]: _, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Budget added",
        description: "The new budget has been added successfully.",
        variant: "success",
      })
      return newBudget
    } catch (err) {
      console.error("Error adding budget:", err)
      
      // Revert optimistic update on error
      setBudgets(prev => prev.filter(bdg => !bdg.id.toString().startsWith('temp-')))
      
      toast({
        title: "Error",
        description: "Failed to add budget",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateBudget = async (budget: DBBudget): Promise<DBBudget> => {
    try {
      // Store original for potential rollback
      const originalBudget = budgets.find(b => b.id === budget.id)
      if (!originalBudget) throw new Error("Budget not found")
      
      // Optimistically update the UI
      setBudgets(prev => 
        prev.map(bdg => bdg.id === budget.id ? {
          ...budget,
          updated_at: new Date().toISOString() 
        } : bdg)
      )
      setPendingOperations(prev => ({ ...prev, [budget.id]: "update" }))
      
      // Actual API call
      const updatedBudget = await BudgetService.updateBudget(budget)
      
      // Update with real data from server
      setBudgets(prev => 
        prev.map(bdg => bdg.id === budget.id ? updatedBudget : bdg)
      )
      
      // Clear pending operation
      setPendingOperations(prev => {
        const { [budget.id]: _, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Budget updated",
        description: "The budget has been updated successfully.",
        variant: "success",
      })
      return updatedBudget
    } catch (err) {
      console.error("Error updating budget:", err)
      
      // Revert optimistic update on error
      const originalBudget = budgets.find(b => b.id === budget.id)
      if (originalBudget) {
        setBudgets(prev => 
          prev.map(bdg => bdg.id === budget.id ? originalBudget : bdg)
        )
      }
      
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteBudget = async (id: string): Promise<void> => {
    try {
      // Store budget for potential rollback
      const budgetToDelete = budgets.find(b => b.id === id)
      if (!budgetToDelete) throw new Error("Budget not found")
      
      // Optimistically update the UI
      setBudgets(prev => prev.filter(bdg => bdg.id !== id))
      setPendingOperations(prev => ({ ...prev, [id]: "delete" }))
      
      // Actual API call
      await BudgetService.deleteBudget(id)
      
      // Clear pending operation
      setPendingOperations(prev => {
        const { [id]: _, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Budget deleted",
        description: "The budget has been deleted successfully.",
        variant: "success",
      })
    } catch (err) {
      console.error("Error deleting budget:", err)
      
      // Revert optimistic delete on error
      const budgetToRestore = budgets.find(b => b.id === id)
      if (budgetToRestore) {
        setBudgets(prev => [...prev, budgetToRestore])
      }
      
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      })
      throw err
    }
  }

  // Filter budgets by period (monthly, yearly, etc.)
  const filterBudgetsByPeriod = (period: string): DBBudget[] => {
    return budgets.filter(budget => budget.period === period)
  }

  // Get total allocated budget
  const getTotalAllocated = (): number => {
    return budgets.reduce((total, budget) => total + Number(budget.amount), 0)
  }

  // Get total spent across all budgets
  const getTotalSpent = (): number => {
    return budgets.reduce((total, budget) => total + Number(budget.spent || 0), 0)
  }

  // Get total remaining budget
  const getTotalRemaining = (): number => {
    return budgets.reduce((total, budget) => total + Number(budget.remaining || 0), 0)
  }

  // Get budget summary
  const getBudgetSummary = () => {
    const totalAllocated = getTotalAllocated()
    const totalSpent = getTotalSpent()
    const totalRemaining = getTotalRemaining()
    const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
    
    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      percentUsed
    }
  }

  // Initial fetch
  useEffect(() => {
    refreshBudgets()
  }, [])

  const value = {
    budgets,
    loading,
    error,
    refreshBudgets,
    getBudgetById,
    getBudgetByCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    filterBudgetsByPeriod,
    getTotalAllocated,
    getTotalSpent,
    getTotalRemaining,
    getBudgetSummary
  }

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudgets() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetProvider")
  }
  return context
} 