"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DBCategory, DBSubscription } from "@/types/supabase"
import { CategoriesService } from "@/app/api/categories/service"
import { SubscriptionsService } from "@/app/api/subscriptions/service"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { DateRange } from "react-day-picker"
import { AddSubscriptionModal } from "@/components/subscriptions/modals/add-subscriptions-modal"
import { EditSubscriptionModal } from "@/components/subscriptions/modals/edit-subscriptions-modal"
import { DeleteSubscriptionModal } from "@/components/subscriptions/modals/delete-subscriptions-modal"

export default function SubscriptionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<DBCategory[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [openAddSubscriptionModal, setOpenAddSubscriptionModal] = useState(false)
  const [openEditSubscriptionModal, setOpenEditSubscriptionModal] = useState(false)
  const [openDeleteSubscriptionModal, setOpenDeleteSubscriptionModal] = useState(false)
  const [subscriptions, setSubscriptions] = useState<DBSubscription[]>([])
  const [selectedSubscription, setSelectedSubscription] = useState<DBSubscription | null>(null)
  const [selectedSubscriptionToDelete, setSelectedSubscriptionToDelete] = useState<DBSubscription | null>(null)

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

  useEffect(() => {
    Promise.all([fetchSubscriptions(), fetchCategories()]);
  }, [fetchSubscriptions, fetchCategories])

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

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }, [categories])

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
        <div className="flex flex-col gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <div className="pb-2">
                <h2 className="text-2xl font-semibold">Subscriptions</h2>
                <p className="text-sm text-muted-foreground">
                  {subscriptions.length} subscriptions found
                </p>
              </div>
              <div>
                <div className="rounded-md border p-4">
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
              </div>
            </div>
        </div>
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
