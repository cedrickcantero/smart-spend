"use client"

import { Plus, Wallet } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { DBCategory, DBIncome } from "@/types/supabase"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/app/contexts/CategoriesContext"
import { IncomeService } from "@/app/api/income/service"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash } from "lucide-react"
import { CustomDataTable, Column, Action } from "@/components/common/custom-data-table" 
import { AddIncomeModal } from "@/components/income/modals/add-income-modal"
import { EditIncomeModal } from "@/components/income/modals/edit-income-modal"
import { DeleteIncomeModal } from "@/components/income/modals/delete-income-modal"

export default function IncomePage() {
  const [income, setIncome] = useState<DBIncome[]>([])
  const [categoriesMap, setCategoriesMap] = useState<Record<string, DBCategory>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIncome, setSelectedIncome] = useState<DBIncome[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentIncome, setCurrentIncome] = useState<DBIncome | null>(null)
  const { toast } = useToast()
  const { categories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchIncome()
  }, [])

  useEffect(() => {
    const map: Record<string, DBCategory> = {}
    categories.forEach(category => {
      map[category.id] = category
    })
    setCategoriesMap(map)
  }, [categories])

  const fetchIncome = async () => {
    setIsLoading(true)
    try {
      const incomeData = await IncomeService.getIncome()
      setIncome(incomeData)
    } catch (error) {
      console.error('Error fetching income:', error)
      toast({
        title: "Error",
        description: "Failed to load income data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteIncome = async (incomeItem: DBIncome) => {
    setCurrentIncome(incomeItem)
    setShowDeleteModal(true)
  }

  const handleEditIncome = async (incomeItem: DBIncome) => {
    setCurrentIncome(incomeItem)
    setShowEditModal(true)
  }

  const handleDeleteSelected = async () => {
    try {
      for (const item of selectedIncome) {
        await IncomeService.deleteIncome(item.id)
      }
      
      toast({
        title: "Income deleted",
        description: `${selectedIncome.length} income entries have been deleted.`,
        variant: "success",
      })
      
      setSelectedIncome([])
      await fetchIncome()
    } catch (error) {
      console.error('Error deleting selected income:', error)
      toast({
        title: "Error",
        description: "Failed to delete selected income. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: Column[] = [
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span>{value}</span>
          {row.description && (
            <span className="text-xs text-muted-foreground">{row.description}</span>
          )}
        </div>
      )
    },
    {
      key: "category_id",
      label: "Category",
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="flex w-fit items-center justify-center gap-1">
          <span>{value ? categoriesMap[value]?.icon || "📋" : "📋"}</span>
          <span>{value ? categoriesMap[value]?.name || "Uncategorized" : "Uncategorized"}</span>
        </Badge>
      )
    },
    {
      key: "date",
      label: "Date",
      type: "date",
      sortable: true
    },
    {
      key: "amount",
      label: "Amount",
      type: "money",
      sortable: true
    }
  ]

  const actions = (row: DBIncome): Action[] => [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => handleEditIncome(row)
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: () => handleDeleteIncome(row)
    }
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-10 w-[120px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }


  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const addButton = {
    label: "Add Income",
    icon: <Plus className="h-4 w-4" />,
    onClick: () => setShowAddModal(true)
  }   
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Income"
        subheading="Track and manage all your income sources"
        icon={<Wallet className="h-6 w-6" />}
      />
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Income History</CardTitle>
            <CardDescription>
              Manage and track your income sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomDataTable
              data={income}
              columns={columns}
              actions={actions}
              addButton={addButton}
              emptyMessage="No income entries yet. Add your first income entry to start tracking your finances."
              initialSortConfig={{ key: "date", direction: "descending" }}
              selectable={true}
              onSelectionChange={setSelectedIncome}
              selectedRows={selectedIncome}
              pagination={{
                itemsPerPage: 10,
                itemsPerPageOptions: [5, 10, 25, 50]
              }}
              searchField={{
                field: "source",
                type: "string",
                placeholder: "Search by source..."
              }}
              filters={[
                {
                  key: "category_id",
                  label: "Category",
                  type: "select",
                  options: categories.map(c => ({ label: c.name, value: c.id })),
                  value: selectedCategory || "",
                  onChange: handleCategoryChange,
                }
              ]}      
              
              modals={{
                add: (
                  <AddIncomeModal
                    open={showAddModal}
                    onOpenChange={setShowAddModal}
                    fetchIncome={fetchIncome}
                    categories={categories}
                  />
                )
              }}
            />
            
            {selectedIncome.length > 0 && (
              <div className="flex justify-between items-center border-t mt-4 pt-4 bg-muted/50 px-4 py-2 rounded-md">
                <div className="text-sm text-muted-foreground">
                  {selectedIncome.length} item{selectedIncome.length !== 1 ? "s" : ""} selected
                </div>
                <button 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-1 rounded-md text-sm font-medium flex items-center"
                  onClick={handleDeleteSelected}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {currentIncome && (
        <>
          <EditIncomeModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            fetchIncome={fetchIncome}
            income={currentIncome}
            categories={categories}
          />
          
          <DeleteIncomeModal
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            income={currentIncome}
            fetchIncome={fetchIncome}
          />
        </>
      )}
    </div>
  )
} 