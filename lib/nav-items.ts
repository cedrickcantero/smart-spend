import {   
  BadgeDollarSign,
  BarChart3,
  Calendar,
  FileText,
  Home,
  Package,
  Receipt, } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface SubMenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  submenu?: SubMenuItem[];
  permission?: string[];
}

export const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Expenses",
      submenu: [
        {
          title: "All Expenses",
          url: "/expenses",
          icon: Receipt,
        },
        {
          title: "Recurring",
          url: "/recurring",
          icon: Receipt,
        },
        {
          title: "Subscriptions",
          url: "/subscriptions",
          icon: Receipt,
        },
      ],
      icon: Receipt,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: BadgeDollarSign,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Tax Reports",
      url: "/tax-reports",
      icon: FileText,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Package,
    }, 
  ]
