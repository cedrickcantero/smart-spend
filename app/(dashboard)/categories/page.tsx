"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddCategoryForm } from "@/components/categories/form/add-category-form"
import { CategoryCard } from "@/components/categories/category-card"
import { DBCategory } from "@/types/supabase"
import { EditCategoryModal } from "@/components/categories/modals/edit-category-modal"
import { useCategories } from "@/app/contexts/CategoriesContext"

export default function CategoriesPage() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<DBCategory | null>(null)

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleAddCategory = async (newCategory: DBCategory) => {
    try {
      await addCategory(newCategory)
      setIsAddingCategory(false)
    } catch (error) {
      console.error("Error adding category:", error)
    }
  }

  const handleUpdateCategory = async (updatedCategory: DBCategory) => {
    try {
      await updateCategory(updatedCategory)
      setEditingCategory(null)
    } catch (error) {
      console.error("Error updating category:", error)
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
              category={category as DBCategory}
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
              <p className="mb-4 text-sm text-muted-foreground">You haven&apos;t created any expense categories yet.</p>
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
