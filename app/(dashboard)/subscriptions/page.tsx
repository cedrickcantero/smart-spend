"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DBExpense, DBCategory, DBRecurringBill, DBSubscription } from "@/types/supabase"
import { ExpenseService } from "@/app/api/expense/service"
import { CategoriesService } from "@/app/api/categories/service"
import { SubscriptionsService } from "@/app/api/subscriptions/service"

import { RecurringService } from "@/app/api/recurring/service"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { DateRange } from "react-day-picker"
import { AddExpenseModal } from "@/components/expense/modals/add-expense-modal"
import { EditExpenseModal } from "@/components/expense/modals/edit-expense-modal"
import { DeleteExpenseModal } from "@/components/expense/modals/delete-expense-modal"
import { AddSubscriptionModal } from "@/components/subscriptions/modals/add-subscriptions-modal"
import { EditSubscriptionModal } from "@/components/subscriptions/modals/edit-subscriptions-modal"
import { DeleteSubscriptionModal } from "@/components/subscriptions/modals/delete-subscriptions-modal"

export default function SubscriptionsPage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [openAddSubscriptionModal, setOpenAddSubscriptionModal] = useState(false)
  const [openEditSubscriptionModal, setOpenEditSubscriptionModal] = useState(false)
  const [openDeleteSubscriptionModal, setOpenDeleteSubscriptionModal] = useState(false)
  const [subscriptions, setSubscriptions] = useState<DBSubscription[]>([])
  const [selectedSubscription, setSelectedSubscription] = useState<DBSubscription | null>(null)
  const [selectedSubscriptionToDelete, setSelectedSubscriptionToDelete] = useState<DBSubscription | null>(null)

  // API calls with useCallback to prevent unnecessary recreations
  const fetchSubscriptions = useCallback(async () => {
    try {
      const subscriptions = await SubscriptionsService.getSubscriptions();
      setSubscriptions(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await CategoriesService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [])

  // Initial data fetch with stable dependencies
  useEffect(() => {
    Promise.all([fetchSubscriptions(), fetchCategories()]);
  }, [fetchSubscriptions, fetchCategories])

  // Event handlers with useCallback
  const handleAddSubscriptionClick = useCallback(() => {
    setOpenAddSubscriptionModal(true);
  }, [])

  const handleEditSubscription = useCallback((subscription: DBSubscription) => {
    setSelectedSubscription(subscription);
    setOpenEditSubscriptionModal(true);
  }, [])

  const handleDeleteSubscription = useCallback((subscription: DBSubscription) => {
    setSelectedSubscriptionToDelete(subscription);
    setOpenDeleteSubscriptionModal(true);
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, [])

  const handleDateRangeChange = useCallback((value: DateRange | null) => {
    setDateRange(value);
  }, [])

  // Memoize expensive data transformations
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }, [categories])

  // Memoize table columns to prevent unnecessary recreations
  const subscriptionColumns = useMemo(() => [
    {
      key: "name",
      label: "Name",
      type: "text" as const,
    },
    {
      key: "billing_cycle",
      label: "Billing Cycle",
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
    },
    {
      key: "next_billing_date",
      label: "Next Billing Date",
      type: "date" as const,
    },
    {
      key: "is_active",
      label: "Is Active",
      type: "boolean" as const,
    }
  ], [])

  // Memoize actions to prevent recreations
  const getRowActions = useMemo(() => {
    return (row: DBSubscription) => [
      {
        label: "Edit",
        onClick: () => handleEditSubscription(row),
      },
      {
        label: "Delete",
        onClick: () => handleDeleteSubscription(row),
      }
    ]
  }, [handleEditSubscription, handleDeleteSubscription])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Subscriptions</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 mt-4">
          <TabsContent value="all" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>
                  {subscriptions.length} subscriptions found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <CustomDataTable
                    data={subscriptions}
                    columns={subscriptionColumns}
                    actions={getRowActions}
                    title="Subscriptions"
                    searchField={{
                      field: "name",
                      type: "string",
                    }}
                    addButton={{
                      label: "Add Subscription",
                      onClick: handleAddSubscriptionClick,
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
                        key: "next_billing_date",
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
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      {openAddSubscriptionModal && (
        <AddSubscriptionModal 
          open={openAddSubscriptionModal} 
          onOpenChange={setOpenAddSubscriptionModal} 
          subscriptions={subscriptions}
          fetchSubscriptions={fetchSubscriptions}
        />
      )}
      {selectedSubscription && (
        <EditSubscriptionModal 
          open={openEditSubscriptionModal} 
          onOpenChange={setOpenEditSubscriptionModal} 
          subscription={selectedSubscription}
          fetchSubscriptions={fetchSubscriptions}
        />
      )}
      {selectedSubscriptionToDelete && (
        <DeleteSubscriptionModal
          open={openDeleteSubscriptionModal}
          onOpenChange={setOpenDeleteSubscriptionModal}
          subscription={selectedSubscriptionToDelete}
          fetchSubscriptions={fetchSubscriptions}
        />
      )}
    </div>
  )
}
