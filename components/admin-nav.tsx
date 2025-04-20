"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isCurrentUserAdmin } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, MessageSquare} from "lucide-react"

export function AdminNav() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const checkAdmin = async () => {
      const adminAccess = await isCurrentUserAdmin()
      setIsAdmin(adminAccess)
      setLoading(false)
    }
    
    checkAdmin()
  }, [])

  if (loading) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  // Only show on admin pages
  if (!pathname.startsWith('/admin')) {
    return null
  }

  const adminNavItems = [
    {
      name: "Colors",
      href: "/admin/colors",
      icon: Palette,
      description: "Manage system colors"
    },
    {
      name: "Feedback",
      href: "/admin/feedback",
      icon: MessageSquare,
      description: "View user feedback"
    },
    // {
    //   name: "Users",
    //   href: "/admin/users",
    //   icon: Users,
    //   description: "Manage user accounts"
    // },
    // {
    //   name: "Settings",
    //   href: "/admin/settings",
    //   icon: Settings,
    //   description: "System settings"
    // }
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Admin Navigation</CardTitle>
        <CardDescription>
          Manage system settings and resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {adminNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center p-4 rounded-lg border transition-colors
                ${pathname === item.href
                  ? 'bg-primary/10 border-primary/20'
                  : 'hover:bg-muted/50 border-transparent'
                }`}
            >
              <div className="rounded-full bg-primary/10 p-3 mb-2">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground text-center mt-1">
                {item.description}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 