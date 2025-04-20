import {   
  BadgeDollarSign,
  BarChart3,
  Calendar,
  Home,
  Package,
  Receipt,
  ReceiptText,
  Repeat,
  CreditCard,
  Wallet,
  Settings,
  Palette,
  Users,
  ShieldCheck} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface SubMenuItem {
  title: string;
  url?: string;
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
    title: "Admin",
    icon: ShieldCheck,
    permission: ["admin"],
    submenu: [
      {
        title: "Colors",
        url: "/admin/colors",
        icon: Palette,
      },
      // {
      //   title: "Users",
      //   url: "/admin/users",
      //   icon: Users,
      // },
      // {
      //   title: "Settings",
      //   url: "/admin/settings",
      //   icon: Settings,
      // }
    ],
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Income",
    url: "/income",
    icon: Wallet,
  },
    {
      title: "Expenses",
      submenu: [
        {
          title: "All Expenses",
          url: "/expenses",
          icon: ReceiptText,
        },
        {
          title: "Recurring",
          url: "/recurring",
          icon: Repeat,
        },
        {
          title: "Subscriptions",
          url: "/subscriptions",
          icon: CreditCard,
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
    // {
    //   title: "Tax Reports",
    //   url: "/tax-reports",
    //   icon: FileText,
    // },
    {
      title: "Categories",
      url: "/categories",
      icon: Package,
    },
  ]
