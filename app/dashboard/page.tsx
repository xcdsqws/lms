import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createClient()

  // 사용자 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // 사용자 프로필 정보 가져오기
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const isAdmin = profile?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline">관리자 페이지</Button>
              </Link>
            )}
            <form action="/logout" method="POST">
              <Button type="submit" variant="outline">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">환영합니다, {profile?.full_name || "사용자"}님!</h2>
              <p className="mb-4">역할: {isAdmin ? "관리자" : "학생"}</p>

              {isAdmin ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <Link href="/admin/users">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg">사용자 관리</h3>
                      <p className="text-gray-600">학생 및 관리자 계정을 관리합니다.</p>
                    </div>
                  </Link>
                  <Link href="/admin/subjects">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg">과목 관리</h3>
                      <p className="text-gray-600">과목을 추가하고 관리합니다.</p>
                    </div>
                  </Link>
                  <Link href="/admin/assignments">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg">과제 관리</h3>
                      <p className="text-gray-600">과제를 생성하고 관리합니다.</p>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <Link href="/subjects">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg">내 과목</h3>
                      <p className="text-gray-600">등록된 과목을 확인합니다.</p>
                    </div>
                  </Link>
                  <Link href="/assignments">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg">과제</h3>
                      <p className="text-gray-600">할당된 과제를 확인합니다.</p>
                    </div>
                  </Link>
                  <Link href="/profile">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg">내 프로필</h3>
                      <p className="text-gray-600">프로필 정보를 관리합니다.</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
