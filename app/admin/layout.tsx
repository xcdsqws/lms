import type React from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // 사용자 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // 사용자 프로필 정보 가져오기
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // 관리자가 아니면 대시보드로 리다이렉트
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">관리자 패널</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700">
                대시보드
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block py-2 px-4 hover:bg-gray-700">
                사용자 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/subjects" className="block py-2 px-4 hover:bg-gray-700">
                과목 관리
              </Link>
            </li>
            <li>
              <Link href="/admin/assignments" className="block py-2 px-4 hover:bg-gray-700">
                과제 관리
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-700">
                학생 대시보드
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 bg-gray-100">{children}</div>
    </div>
  )
}
