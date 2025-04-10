"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AddCategoryForm } from "@/components/categories/form/add-category-form"
import { CategoryCard } from "@/components/categories/category-card"
import { CategoriesService } from "@/app/api/categories/service"
import { DBCategory } from "@/types/supabase"
import { EditCategoryModal } from "@/components/categories/modals/edit-category-modal"

type Category = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

// Mock data for categories
const initialCategories: Category[] = [
  { id: "1", name: "Food & Dining", icon: "🍔", color: "#0ea5e9" },
  { id: "2", name: "Housing", icon: "🏠", color: "#3b82f6" },
  { id: "3", name: "Transportation", icon: "🚗", color: "#22c55e" },
  { id: "4", name: "Entertainment", icon: "🎬", color: "#eab308" },
  { id: "5", name: "Shopping", icon: "🛍️", color: "#ef4444" },
  { id: "6", name: "Utilities", icon: "💡", color: "#8b5cf6" },
  { id: "7", name: "Health", icon: "💊", color: "#ec4899" },
]

export default function CategoriesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const fetchCategories = async () => {
    const categories = await CategoriesService.getCategories()
    setCategories(categories)
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Function to handle category deletion
  const handleDeleteCategory = async (id: string) => {
    try {
      // Simulate API call delay
      setLoading(true)

      await CategoriesService.deleteCategory(id)

      await fetchCategories()

      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (newCategory: DBCategory) => {
    try {
      setLoading(true)

      const category = {
        ...newCategory,
      }

      await CategoriesService.createCategory(category)

      await fetchCategories()

      setIsAddingCategory(false)

      toast({
        title: "Category added",
        description: "The new category has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      setLoading(true)

      await CategoriesService.updateCategory(updatedCategory)

      await fetchCategories()

      setEditingCategory(null)

      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setIsAddingCategory(true)} className="gap-1" disabled={isAddingCategory || loading}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {isAddingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new expense category</CardDescription>
          </CardHeader>
          <CardContent>
            <AddCategoryForm onSubmit={handleAddCategory} onCancel={() => setIsAddingCategory(false)} />
          </CardContent>
        </Card>
      )}

      {loading && !categories.length ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => setEditingCategory(category)}
              onDelete={() => handleDeleteCategory(category.id)}
            />
          ))}

          {categories.length === 0 && !isAddingCategory && (
            <Card className="col-span-full flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-medium">No categories found</h3>
              <p className="mb-4 text-sm text-muted-foreground">You haven't created any expense categories yet.</p>
              <Button onClick={() => setIsAddingCategory(true)}>Add Your First Category</Button>
            </Card>
          )}
        </div>
      )}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onSubmit={handleUpdateCategory}
          onCancel={() => setEditingCategory(null)}
          isOpen={!!editingCategory}
        />
      )}
    </div>
  )
}
