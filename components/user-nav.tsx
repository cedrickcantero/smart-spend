"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings, ShieldCheck } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { isCurrentUserAdmin } from "@/lib/auth"

export function UserNav() {
  const { user, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminAccess = await isCurrentUserAdmin()
        setIsAdmin(adminAccess)
      }
    }
    
    checkAdmin()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        variant: "success",
      })
      router.push("/")
    } catch (error) {
      const err = error as { message?: string };

      toast({
        title: "Error",
        description: err.message || "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const firstName = user?.user_metadata?.first_name || '';
  const lastName = user?.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}` || "Anonymous User"
  
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const goToSettings = () => {
    router.push("/settings")
  }

  const goToAdmin = () => {
    router.push("/admin/colors")
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={goToSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={goToAdmin}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
