"use client"

import { Wallet } from "lucide-react"
import { IncomeList } from "@/components/income/income-list"
import { PageHeader } from "@/components/page-header"

export default function IncomePage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Income"
        subheading="Track and manage all your income sources"
        icon={<Wallet className="h-6 w-6" />}
      />
      <div className="mt-6">
        <IncomeList />
      </div>
    </div>
  )
} 