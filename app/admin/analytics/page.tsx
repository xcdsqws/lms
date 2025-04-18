import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { format, subDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverallAnalytics } from "@/components/admin/analytics/overall-analytics"
import { StudentAnalytics } from "@/components/admin/analytics/student-analytics"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "학습 분석 | 관리자 페이지",
  description: "학생들의 학습 데이터 분석 및 통계",
}

export default async function AnalyticsPage() {
  await requireAdmin()
  const supabase = createClient()

  // 최근 30일 날짜 범위
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)
  const startDate = format(thirtyDaysAgo, "yyyy-MM-dd")
  const endDate = format(today, "yyyy-MM-dd")

  // 학생 목록 가져오기
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, username, school, grade, class_number")
    .eq("role", "student")
    .order("full_name")

  // 과목 목록 가져오기
  const { data: subjects } = await supabase.from("subjects").select("*")

  // 최근 30일간 모든 학생의 공부 시간 로그 가져오기
  const { data: studyTimeLogs } = await supabase
    .from("study_time_logs")
    .select("*, subjects(name), profiles(full_name)")
    .gte("study_date", startDate)
    .lte("study_date", endDate)

  // 과목별 총 공부 시간 계산
  const subjectTotalTime = (studyTimeLogs || []).reduce(
    (acc, log) => {
      const subjectName = log.subjects?.name || "Unknown"
      acc[subjectName] = (acc[subjectName] || 0) + log.study_time
      return acc
    },
    {} as { [subject: string]: number },
  )

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold mb-5">학습 분석</h1>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList>
          <TabsTrigger value="overall">전체 통계</TabsTrigger>
          <TabsTrigger value="student">학생별 통계</TabsTrigger>
        </TabsList>
        <TabsContent value="overall">
          <OverallAnalytics
            students={students || []}
            subjects={subjects || []}
            studyTimeLogs={studyTimeLogs || []}
            subjectTotalTime={subjectTotalTime}
          />
        </TabsContent>
        <TabsContent value="student">
          <StudentAnalytics students={students || []} subjects={subjects || []} studyTimeLogs={studyTimeLogs || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
