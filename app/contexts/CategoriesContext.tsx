"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { DBCategory, DBCategoryInsert } from "@/types/supabase"
import { CategoriesService } from "@/app/api/categories/service"
import { useToast } from "@/hooks/use-toast"

interface CategoriesContextType {
  categories: DBCategory[]
  loading: boolean
  error: string | null
  refreshCategories: () => Promise<void>
  addCategory: (category: DBCategoryInsert) => Promise<DBCategory>
  updateCategory: (category: DBCategory) => Promise<DBCategory>
  deleteCategory: (id: string) => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Add a map for tracking pending operations
  const [pendingOperations, setPendingOperations] = useState<{
    [id: string]: "create" | "update" | "delete"
  }>({})

  const refreshCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await CategoriesService.getCategories()
      setCategories(data)
    } catch (err) {
      console.error("Failed to fetch categories:", err)
      setError("Failed to load categories")
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (category: DBCategoryInsert): Promise<DBCategory> => {
    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`
      const optimisticCategory = {
        ...category,
        id: tempId,
        created_at: new Date().toISOString(),
      } as unknown as DBCategory
      
      // Optimistically update the UI
      setCategories(prev => [...prev, optimisticCategory])
      setPendingOperations(prev => ({ ...prev, [tempId]: "create" }))
      
      // Actual API call
      const newCategory = await CategoriesService.createCategory(category)
      
      // Update with real data from server
      setCategories(prev => 
        prev.map(cat => cat.id === tempId ? newCategory : cat)
      )
      
      // Clear pending operation
      setPendingOperations(prev => {
        const { [tempId]: _, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Category added",
        description: "The new category has been added successfully.",
        variant: "success",
      })
      return newCategory
    } catch (err) {
      console.error("Error adding category:", err)
      
      // Revert optimistic update on error
      setCategories(prev => 
        prev.filter(cat => !cat.id.toString().startsWith('temp-'))
      )
      
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateCategory = async (category: DBCategory): Promise<DBCategory> => {
    try {
      // Store original for potential rollback
      const originalCategory = categories.find(c => c.id === category.id)
      if (!originalCategory) throw new Error("Category not found")
      
      // Optimistically update the UI
      setCategories(prev => 
        prev.map(cat => cat.id === category.id ? category : cat)
      )
      setPendingOperations(prev => ({ ...prev, [category.id]: "update" }))
      
      // Actual API call
      const updatedCategory = await CategoriesService.updateCategory(category)
      
      // Update with real data from server
      setCategories(prev => 
        prev.map(cat => cat.id === category.id ? updatedCategory : cat)
      )
      
      // Clear pending operation
      setPendingOperations(prev => {
        const { [category.id]: _, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
        variant: "success",
      })
      return updatedCategory
    } catch (err) {
      console.error("Error updating category:", err)
      
      // Revert optimistic update on error
      const originalCategory = categories.find(c => c.id === category.id)
      if (originalCategory) {
        setCategories(prev => 
          prev.map(cat => cat.id === category.id ? originalCategory : cat)
        )
      }
      
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      // Store category for potential rollback
      const categoryToDelete = categories.find(c => c.id === id)
      if (!categoryToDelete) throw new Error("Category not found")
      
      // Optimistically update the UI
      setCategories(prev => prev.filter(cat => cat.id !== id))
      setPendingOperations(prev => ({ ...prev, [id]: "delete" }))
      
      // Actual API call
      await CategoriesService.deleteCategory(id)
      
      // Clear pending operation
      setPendingOperations(prev => {
        const { [id]: _, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
        variant: "success",
      })
    } catch (err) {
      console.error("Error deleting category:", err)
      
      // Revert optimistic delete on error
      const categoryToRestore = categories.find(c => c.id === id)
      if (categoryToRestore) {
        setCategories(prev => [...prev, categoryToRestore])
      }
      
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [])

  const value = {
    categories,
    loading,
    error,
    refreshCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  }

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
} 