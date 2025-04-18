import type React from "react"
import { checkAdmin } from "@/utils/auth-check"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 관리자 권한 확인
  await checkAdmin()

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
