import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StudyTimeSummaryProps {
  summary: {
    totalStudyTime: {
      hours: number
      minutes: number
      totalMinutes: number
    }
    averageStudyTime: {
      hours: number
      minutes: number
      totalMinutes: number
    }
    daysStudied: number
    totalDays: number
    studyRate: number
    mostStudiedSubject: {
      name: string
      minutes: number
      hours: number
      remainingMinutes: number
    }
    mostStudiedDay: {
      date: string
      formattedDate: string
      minutes: number
      hours: number
      remainingMinutes: number
    }
  }
}

export function StudyTimeSummary({ summary }: StudyTimeSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 공부 시간</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.totalStudyTime.hours}시간 {summary.totalStudyTime.minutes}분
          </div>
          <p className="text-xs text-muted-foreground">기간 내 총 공부 시간</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">일평균 공부 시간</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.averageStudyTime.hours}시간 {summary.averageStudyTime.minutes}분
          </div>
          <p className="text-xs text-muted-foreground">공부한 날의 평균 시간</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">공부한 날</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.daysStudied}일 / {summary.totalDays}일 ({summary.studyRate}%)
          </div>
          <p className="text-xs text-muted-foreground">기간 내 공부한 날의 비율</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">가장 많이 공부한 과목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{summary.mostStudiedSubject.name}</div>
          <p className="text-xs text-muted-foreground">
            {summary.mostStudiedSubject.hours > 0 ? `${summary.mostStudiedSubject.hours}시간 ` : ""}
            {summary.mostStudiedSubject.remainingMinutes}분
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
