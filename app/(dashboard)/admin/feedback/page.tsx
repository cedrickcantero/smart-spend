"use client"

import { useState, useEffect } from "react"
import { CustomDataTable } from "@/components/common/custom-data-table"
import { Check, AlertTriangle, MessageSquare, Lightbulb, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { isCurrentUserAdmin } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { FeedbackService, FeedbackWithUserInfo } from "@/app/api/feedback/service"

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackWithUserInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  console.log("feedback", feedback)

  useEffect(() => {
    const checkAdmin = async () => {
      const adminAccess = await isCurrentUserAdmin()
      setIsAdmin(adminAccess)
      
      if (!adminAccess) {
        router.push("/dashboard")
        return
      }
      
      fetchFeedback()
    }
    
    checkAdmin()
  }, [router])

  const fetchFeedback = async () => {
    setIsLoading(true)
    try {
      const data = await FeedbackService.getFeedback()
      setFeedback(data || [])
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
      case "in-progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns = [
    {
      key: "created_at",
      label: "Date",
      type: "date" as const,
      sortable: true,
      render: (value: string) => value ? format(new Date(value), "MMM d, yyyy h:mm a") : "-"
    },
    {
      key: "feedback_type",
      label: "Type",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getFeedbackTypeIcon(value)}
          <span className="capitalize">{value}</span>
        </div>
      )
    },
    {
      key: "feedback_text",
      label: "Feedback",
      render: (value: string) => (
        <div className="max-w-md truncate">{value}</div>
      )
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    }
  ]

  const actions = (row: FeedbackWithUserInfo) => [
    {
      label: "Mark as In Progress",
      onClick: async () => {
        await updateFeedbackStatus(row.id, "in-progress")
      }
    },
    {
      label: "Mark as Resolved",
      onClick: async () => {
        await updateFeedbackStatus(row.id, "resolved")
      }
    },
    {
      label: "Close",
      onClick: async () => {
        await updateFeedbackStatus(row.id, "closed")
      }
    }
  ]

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      await FeedbackService.updateFeedbackStatus(id, status)
      fetchFeedback()
    } catch (error) {
      console.error("Error updating feedback status:", error)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">User Feedback</h1>
      <CustomDataTable
        data={feedback}
        columns={columns}
        actions={actions}
        emptyMessage="No feedback received yet."
        title="All Feedback"
        filters={[
          {
            key: "feedback_type",
            label: "Type",
            type: "select",
            options: [
              { label: "General", value: "general" },
              { label: "Suggestion", value: "suggestion" },
              { label: "Bug", value: "bug" },
              { label: "Question", value: "question" }
            ],
            value: "all",
            onChange: () => {}
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "New", value: "new" },
              { label: "In Progress", value: "in-progress" },
              { label: "Resolved", value: "resolved" },
              { label: "Closed", value: "closed" }
            ],
            value: "all",
            onChange: () => {}
          }
        ]}
        searchField={[
          { field: "feedback_text", type: "string", placeholder: "Search feedback..." },
          { field: "profiles.email", type: "string", placeholder: "Search by email..." }
        ]}
      />
    </div>
  )
} 