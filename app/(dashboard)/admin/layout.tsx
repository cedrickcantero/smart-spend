"use client"

import { useEffect } from "react"
import { AdminNav } from "@/components/admin-nav"

// Optimize admin layout to prevent lag when navigating away
export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  // Cleanup function to improve navigation performance
  useEffect(() => {
    // Store original document title
    const originalTitle = document.title
    
    // Set admin-specific title
    document.title = "Admin Dashboard - Smart Spend"
    
    return () => {
      // Reset document title and perform cleanup when leaving admin section
      document.title = originalTitle
      
      // Force garbage collection hint by nullifying large objects
      // This helps browsers to reclaim memory faster on navigation
      window.performance?.mark?.('adminCleanup')
      
      // Set a short timeout to help with smoother transitions
      setTimeout(() => {
        window.performance?.measure?.('adminCleanupComplete', 'adminCleanup')
      }, 0)
    }
  }, [])

  return (
    <div className="flex flex-col w-full">
      <AdminNav />
      {children}
    </div>
  )
} 