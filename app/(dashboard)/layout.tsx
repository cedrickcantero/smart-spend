import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { CategoriesProvider } from "@/app/contexts/CategoriesContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <CategoriesProvider>
        <AppSidebar>{children}</AppSidebar>
      </CategoriesProvider>
    </ProtectedRoute>
  )
}
