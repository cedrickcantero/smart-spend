import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AppSidebar>{children}</AppSidebar>
    </ProtectedRoute>
  )
}
