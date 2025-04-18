import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const session = await getSession()

  if (session) {
    const supabase = createClient()
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role === "admin") {
      redirect("/admin/dashboard")
    } else {
      redirect("/student/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4 py-8 sm:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">학습 관리 시스템</h1>
          <p className="mt-2 text-sm text-gray-600">로그인하여 학습 관리를 시작하세요</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
