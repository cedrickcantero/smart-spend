"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase/client"
import { isCurrentUserAdmin } from "@/lib/auth"
import { toast } from "sonner"

type User = {
  id: string
  email: string
  created_at: string
  role: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
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
      
      fetchUsers()
    }
    
    checkAccess()
  }, [router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // This is a simplified approach
      // In a real application, you would use the admin API or a server function
      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('user_id, settings')
      
      if (settingsError) throw settingsError
      
      // Get user details from auth.users (this would require a server function in a real app)
      // For demo purposes, we'll create mock data based on user_settings
      const formattedUsers = userSettings.map(setting => ({
        id: setting.user_id,
        email: `user_${setting.user_id.substring(0, 6)}@example.com`, // Mock email
        created_at: new Date().toISOString(), // Mock creation date
        role: setting.settings?.role || 'user'
      }))
      
      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const { data: userSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .single()
      
      if (fetchError) throw fetchError
      
      const updatedSettings = {
        ...userSettings.settings,
        role: 'admin'
      }
      
      const { error } = await supabase
        .from('user_settings')
        .update({ settings: updatedSettings })
        .eq('user_id', userId)
      
      if (error) throw error
      
      toast.success('User promoted to admin')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleDemoteToUser = async (userId: string) => {
    try {
      const { data: userSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', userId)
        .single()
      
      if (fetchError) throw fetchError
      
      const updatedSettings = {
        ...userSettings.settings,
        role: 'user'
      }
      
      const { error } = await supabase
        .from('user_settings')
        .update({ settings: updatedSettings })
        .eq('user_id', userId)
      
      if (error) throw error
      
      toast.success('User demoted to regular user')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

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
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-4 gap-4 p-4 font-semibold border-b">
              <div>Email</div>
              <div>Created</div>
              <div>Role</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="p-4 text-center">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center">No users found</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                    <div>{user.email}</div>
                    <div>{new Date(user.created_at).toLocaleDateString()}</div>
                    <div>
                      <Badge variant={user.role === 'admin' ? "destructive" : "secondary"}>
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {user.role === 'admin' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoteToUser(user.id)}
                        >
                          Demote to User
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteToAdmin(user.id)}
                        >
                          Promote to Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchUsers}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 