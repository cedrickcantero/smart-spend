import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { CategoriesProvider } from "@/app/contexts/CategoriesContext"
import { ColorsProvider } from "@/app/contexts/ColorsContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <ColorsProvider>
        <CategoriesProvider>
          <AppSidebar>{children}</AppSidebar>
        </CategoriesProvider>
      </ColorsProvider>
    </ProtectedRoute>
  )
}
