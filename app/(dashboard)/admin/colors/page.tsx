"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { DBColor } from "@/types/supabase"
import { isCurrentUserAdmin } from "@/lib/auth"
import { toast } from "sonner"
import { ColorsService } from "@/app/api/colors/service"
import { useColors } from "@/app/contexts/ColorsContext"

export default function ColorsAdminPage() {
  const { colors, loading, refreshColors } = useColors()
  const [isAdmin, setIsAdmin] = useState(false)
  const [newColor, setNewColor] = useState({
    name: "",
    hex_value: "#000000",
    tailwind_key: ""
  })
  const router = useRouter()
  const unmountedRef = useRef(false)

  useEffect(() => {
    unmountedRef.current = false
    
    const checkAccess = async () => {
      const adminAccess = await isCurrentUserAdmin()
      
      if (unmountedRef.current) return
      
      setIsAdmin(adminAccess)
      
      if (!adminAccess) {
        toast.error("You don't have permission to access this page")
        router.push('/dashboard')
        return
      }
      
    }
    
    checkAccess()
    
    return () => {
      unmountedRef.current = true
    }
  }, [router])

  const handleAddColor = async () => {
    if (!newColor.name || !newColor.hex_value || !newColor.tailwind_key) {
      toast.error('Please fill in all fields')
      return
    }
    
    try {
      await ColorsService.createColor(newColor as DBColor)
      toast.success('Color added successfully')
      setNewColor({
        name: "",
        hex_value: "#000000",
        tailwind_key: ""
      })
      refreshColors()
    } catch (error) {
      console.error('Error adding color:', error)
      toast.error('Failed to add color')
    }
  }

  const handleDeleteColor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('colors')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Color deleted successfully')
      refreshColors()
    } catch (error) {
      console.error('Error deleting color:', error)
      toast.error('Failed to delete color')
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
      <h1 className="text-2xl font-bold mb-6">Color Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Color Management</CardTitle>
          <CardDescription>
            Add, edit, or remove colors from the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="colorName">Name</Label>
                <Input
                  id="colorName"
                  value={newColor.name}
                  onChange={(e) => setNewColor({...newColor, name: e.target.value})}
                  placeholder="e.g., Sky Blue"
                />
              </div>
              <div>
                <Label htmlFor="hexValue">Hex Value</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="hexValue"
                    type="color"
                    value={newColor.hex_value}
                    onChange={(e) => setNewColor({...newColor, hex_value: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={newColor.hex_value}
                    onChange={(e) => setNewColor({...newColor, hex_value: e.target.value})}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tailwindKey">Tailwind Key</Label>
                <Input
                  id="tailwindKey"
                  value={newColor.tailwind_key}
                  onChange={(e) => setNewColor({...newColor, tailwind_key: e.target.value})}
                  placeholder="e.g., blue-500"
                />
              </div>
              <Button onClick={handleAddColor}>Add Color</Button>
            </div>

            <div className="border rounded-md">
              <div className="grid grid-cols-5 gap-4 p-4 font-semibold border-b">
                <div>Color</div>
                <div>Name</div>
                <div>Hex Value</div>
                <div>Tailwind Key</div>
                <div></div>
              </div>
              <div className="divide-y max-h-[400px] overflow-auto">
                {loading ? (
                  <div className="p-4 text-center">Loading colors...</div>
                ) : colors.length === 0 ? (
                  <div className="p-4 text-center">No colors found</div>
                ) : (
                  colors.map((color) => (
                    <div key={color.id} className="grid grid-cols-5 gap-4 p-4 items-center">
                      <div>
                        <div
                          className="h-8 w-8 rounded-full"
                          style={{ backgroundColor: color.hex_value }}
                        />
                      </div>
                      <div>{color.name}</div>
                      <div>{color.hex_value}</div>
                      <div>{color.tailwind_key}</div>
                      <div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteColor(color.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={refreshColors}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 