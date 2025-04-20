import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { CategoriesProvider } from "@/app/contexts/CategoriesContext"
import { ColorsProvider } from "@/app/contexts/ColorsContext"
import { ExpenseProvider } from "@/app/contexts/ExpenseContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <ColorsProvider>
        <CategoriesProvider>
          <ExpenseProvider>
            <AppSidebar>{children}</AppSidebar>
          </ExpenseProvider>
        </CategoriesProvider>
      </ColorsProvider>
    </ProtectedRoute>
  )
}
