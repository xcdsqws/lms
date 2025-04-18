import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { requireAdmin } from "@/lib/auth"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">{children}</main>
      </div>
    </ErrorBoundary>
  )
}
