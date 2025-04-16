import { AdminNav } from "@/components/admin-nav"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col w-full">
      <AdminNav />
      {children}
    </div>
  )
} 