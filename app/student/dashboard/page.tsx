import { requireStudent } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentAssignmentList } from "@/components/student/student-assignment-list"
import { StudentSchedule } from "@/components/student/student-schedule"
import { StudentAnnouncements } from "@/components/student/student-announcements"

export default async function StudentDashboard() {
  const session = await requireStudent()
  const supabase = createClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const { data: subjects } = await supabase.from("subjects").select("*")

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, subjects(*)")
    .order("due_date", { ascending: true })
    .limit(5)

  const { data: progress } = await supabase.from("progress").select("*").eq("student_id", session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">안녕하세요, {profile?.full_name || "학생"}님!</h1>
        <p className="text-muted-foreground">오늘의 학습 현황과 일정을 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 과목</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중인 과제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments?.filter((a) => {
                const dueDate = new Date(a.due_date || "")
                return dueDate > new Date()
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료한 과제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.filter((p) => p.status === "completed").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress && progress.length > 0
                ? Math.round(
                    progress.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                      progress.filter((p) => p.score !== null).length,
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assignments">과제</TabsTrigger>
          <TabsTrigger value="schedule">일정</TabsTrigger>
          <TabsTrigger value="announcements">공지사항</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments" className="space-y-4">
          <StudentAssignmentList assignments={assignments || []} />
        </TabsContent>
        <TabsContent value="schedule" className="space-y-4">
          <StudentSchedule studentId={session.user.id} />
        </TabsContent>
        <TabsContent value="announcements" className="space-y-4">
          <StudentAnnouncements />
        </TabsContent>
      </Tabs>
    </div>
  )
}
