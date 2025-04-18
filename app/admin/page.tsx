import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 통계 데이터 가져오기
  const { count: studentsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: subjectsCount } = await supabase.from("subjects").select("*", { count: "exact", head: true })

  const { count: assignmentsCount } = await supabase.from("assignments").select("*", { count: "exact", head: true })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">총 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">총 과목 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjectsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">총 과제 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignmentsCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
