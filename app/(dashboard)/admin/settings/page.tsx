"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isCurrentUserAdmin } from "@/lib/auth"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const adminAccess = await isCurrentUserAdmin()
      setIsAdmin(adminAccess)
      
      if (!adminAccess) {
        toast.error("You don't have permission to access this page")
        router.push('/dashboard')
        return
      }
    }
    
    checkAccess()
  }, [router])

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage global application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This is a placeholder for admin settings. Additional settings controls would be implemented here.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Reset to Defaults</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 