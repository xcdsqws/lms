import { requireStudent } from "@/lib/auth"
import { format, subDays } from "date-fns"
import { ko } from "date-fns/locale"
import { StudentAnalyticsDashboard } from "@/components/student/analytics/student-analytics-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "학습 분석 | 학습 관리 시스템",
  description: "학생 학습 데이터 분석 및 통계",
}

export default async function StudentAnalyticsPage() {
  await requireStudent()

  // 최근 30일 날짜 범위
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)
  const startDate = format(thirtyDaysAgo, "yyyy-MM-dd")
  const endDate = format(today, "yyyy-MM-dd")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">내 학습 분석</h1>
        <p className="text-muted-foreground">
          {format(thirtyDaysAgo, "PPP", { locale: ko })} ~ {format(today, "PPP", { locale: ko })}
        </p>
      </div>

      <StudentAnalyticsDashboard />
    </div>
  )
}
