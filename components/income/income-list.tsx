"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AddIncomeModal } from "@/components/income/modals/add-income-modal"
import { useToast } from "@/hooks/use-toast"
import { IncomeService } from "@/app/api/income/service"
import { DBCategory, DBIncome } from "@/types/supabase"
import { CategoriesService } from "@/app/api/categories/service"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney } from "@/lib/utils"
import { UserSettings } from "@/types/userSettings"
import { useAuth } from "@/lib/auth-context"

export function IncomeList() {
  const [income, setIncome] = useState<DBIncome[]>([])
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [categoriesMap, setCategoriesMap] = useState<Record<string, DBCategory>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIncome, setSelectedIncome] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const { toast } = useToast()

  const { userSettings: dbUserSettings } = useAuth()
  const userSettings = dbUserSettings as unknown as UserSettings
  const userCurrency = userSettings?.preferences?.currency || "USD"

  useEffect(() => {
    fetchIncome()
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const categoryData = await CategoriesService.getCategories()
      setCategories(categoryData)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      await IncomeService.deleteIncome(id)
      toast({
        title: "Income deleted",
        description: "Income entry has been deleted successfully.",
        variant: "success",
      })
      await fetchIncome()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete income. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIncome(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedIncome.length === income.length) {
      setSelectedIncome([])
    } else {
      setSelectedIncome(income.map(item => item.id))
    }
  }

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedIncome) {
        await IncomeService.deleteIncome(id)
      }
      
      toast({
        title: "Income deleted",
        description: `${selectedIncome.length} income entries have been deleted.`,
        variant: "success",
      })
      
      setSelectedIncome([])
      await fetchIncome()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected income. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized"
    return categoriesMap[categoryId]?.name || "Uncategorized"
  }

  const getCategoryIcon = (categoryId: string | null) => {
    if (!categoryId) return "📋"
    return categoriesMap[categoryId]?.icon || "📋"
  }

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0)

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Income History</span>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Income
          </Button>
        </CardTitle>
        <CardDescription>
          Manage and track your income sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        {income.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <h3 className="mt-4 text-lg font-semibold">No income entries yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Add your first income entry to start tracking your finances.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Income
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={selectedIncome.length === income.length && income.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {income.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIncome.includes(item.id)}
                        onCheckedChange={() => handleToggleSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.source}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center justify-center gap-1">
                        <span>{getCategoryIcon(item.category_id)}</span>
                        <span>{getCategoryName(item.category_id)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(item.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(item.amount, userCurrency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-destructive focus:text-destructive" 
                            onClick={() => handleDeleteIncome(item.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total Income
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(totalIncome, userCurrency)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
      {selectedIncome.length > 0 && (
        <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
          <div className="text-sm text-muted-foreground">
            {selectedIncome.length} item{selectedIncome.length !== 1 ? "s" : ""} selected
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSelected}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </CardFooter>
      )}
      <AddIncomeModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
        fetchIncome={fetchIncome}
        categories={categories}
      />
    </Card>
  )
} 