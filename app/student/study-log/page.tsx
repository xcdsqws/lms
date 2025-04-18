import { requireStudent } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { StudyLogForm } from "@/components/student/study-log-form"
import { StudyTimeTracker } from "@/components/student/study-time-tracker"
import { SelfEvaluationForm } from "@/components/student/self-evaluation-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyStudyLogs } from "@/components/student/daily-study-logs"

export default async function StudyLogPage() {
  const session = await requireStudent()
  const supabase = createClient()

  // 과목 목록 가져오기
  const { data: subjects } = await supabase.from("subjects").select("*")

  // 오늘 날짜
  const today = format(new Date(), "yyyy-MM-dd")

  // 오늘의 자기평가 가져오기
  const { data: todayEvaluation } = await supabase
    .from("self_evaluations")
    .select("*")
    .eq("student_id", session.user.id)
    .eq("evaluation_date", today)
    .single()

  // 오늘의 공부 시간 로그 가져오기
  const { data: todayTimeLogs } = await supabase
    .from("study_time_logs")
    .select("*, subjects(name)")
    .eq("student_id", session.user.id)
    .eq("study_date", today)

  // 오늘의 공부 기록 가져오기
  const { data: todayStudyLogs } = await supabase
    .from("study_logs")
    .select("*, subjects(name)")
    .eq("student_id", session.user.id)
    .eq("study_date", today)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">일일 공부 기록</h1>
        <p className="text-muted-foreground">{format(new Date(), "PPP (EEEE)", { locale: ko })}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 공부 시간</CardTitle>
            <CardDescription>과목별 공부 시간을 측정하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <StudyTimeTracker subjects={subjects || []} userId={session.user.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>공부 시간 요약</CardTitle>
            <CardDescription>오늘 공부한 총 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                {todayTimeLogs?.reduce((total, log) => total + log.duration_minutes, 0) || 0}분
              </div>
              <div className="space-y-2">
                {todayTimeLogs?.map((log) => (
                  <div key={log.id} className="flex justify-between items-center">
                    <span>{(log.subjects as any)?.name || "알 수 없는 과목"}</span>
                    <span className="font-medium">{log.duration_minutes}분</span>
                  </div>
                ))}
                {(!todayTimeLogs || todayTimeLogs.length === 0) && (
                  <p className="text-muted-foreground">오늘 기록된 공부 시간이 없습니다.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">공부 기록</TabsTrigger>
          <TabsTrigger value="evaluation">자기평가</TabsTrigger>
          <TabsTrigger value="history">기록 보기</TabsTrigger>
        </TabsList>
        <TabsContent value="log" className="space-y-4">
          <StudyLogForm subjects={subjects || []} userId={session.user.id} />
        </TabsContent>
        <TabsContent value="evaluation" className="space-y-4">
          <SelfEvaluationForm userId={session.user.id} existingEvaluation={todayEvaluation} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <DailyStudyLogs userId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
