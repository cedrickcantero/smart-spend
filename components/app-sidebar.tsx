"use client"

import type * as React from "react"
import Link from "next/link"
import {
  Package2,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { sidebarItems, SidebarItem } from "@/lib/nav-items"
import { ChevronDown, ChevronRight } from "lucide-react"
import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar"

import { useState, useEffect } from "react"
import { isCurrentUserAdmin } from "@/lib/auth"

export function AppSidebar({ children }: { children: React.ReactNode }) {

  const [collapsibleMenus, setCollapsibleMenus] = useState<Record<string, boolean>>({
    Expenses: true,
    Admin: true,
  })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const adminAccess = await isCurrentUserAdmin()
      setIsAdmin(adminAccess)
    }
    
    checkAdmin()
  }, [])

  const toggleMenu = (menuTitle: string) => {
    setCollapsibleMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }))
  }

  const shouldShowMenuItem = (item: SidebarItem) => {
    // If item requires admin permission, check if user is admin
    if (item.permission?.includes("admin")) {
      return isAdmin
    }
    return true
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Package2 className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">ExpenseTracker</span>
                    <span className="text-xs">Manage your finances</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
              {sidebarItems.filter(item => shouldShowMenuItem(item)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <Collapsible open={collapsibleMenus[item.title]}>
                      <CollapsibleTrigger asChild onClick={() => toggleMenu(item.title)}>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                          {collapsibleMenus[item.title] ? (
                            <ChevronDown className="ml-auto h-4 w-4" />
                          ) : (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((subitem) => (
                            <SidebarMenuSubItem key={subitem.title}>
                              <SidebarMenuSubButton asChild>
                                {subitem.url ? (
                                  <Link href={subitem.url}>
                                    <subitem.icon />
                                    <span>{subitem.title}</span>
                                  </Link>
                                ) : (
                                  <div>
                                    <subitem.icon />
                                    <span>{subitem.title}</span>
                                  </div>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      {item.url ? (
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <div>
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                      )}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu> */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden md:flex gap-1">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}
