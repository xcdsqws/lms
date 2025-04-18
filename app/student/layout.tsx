import type React from "react"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { requireStudent } from "@/lib/auth"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireStudent()

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <StudentSidebar />
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">{children}</main>
      </div>
    </ErrorBoundary>
  )
}
