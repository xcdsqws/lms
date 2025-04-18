import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStudentList } from "@/components/admin/admin-student-list"
import { AdminAssignmentList } from "@/components/admin/admin-assignment-list"

export default async function AdminDashboard() {
  const session = await requireAdmin()
  const supabase = createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const { data: students, count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "student")
    .limit(5)

  const { data: subjects, count: subjectCount } = await supabase.from("subjects").select("*", { count: "exact" })

  const { data: assignments, count: assignmentCount } = await supabase
    .from("assignments")
    .select("*, subjects(*)", { count: "exact" })
    .order("due_date", { ascending: true })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">안녕하세요, {profile?.full_name || "관리자"}님!</h1>
        <p className="text-muted-foreground">학습 관리 시스템의 현황을 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 과목 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 과제 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date().toLocaleDateString("ko-KR")}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">학생</TabsTrigger>
          <TabsTrigger value="assignments">과제</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="space-y-4">
          <AdminStudentList students={students || []} />
        </TabsContent>
        <TabsContent value="assignments" className="space-y-4">
          <AdminAssignmentList assignments={assignments || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
