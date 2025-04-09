"use client"

import type React from "react"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If authentication is done loading and there's no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not loading and user exists, render children
  if (!isLoading && user) {
    return <>{children}</>
  }

  // This return is technically not needed as the redirect will happen,
  // but we need it to satisfy TypeScript/React
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}