"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { format, parseISO, eachDayOfInterval } from "date-fns"
import { ko } from "date-fns/locale"

interface Subject {
  id: string
  name: string
}

interface StudentRanking {
  id: string
  name: string
  totalMinutes: number
}

interface OverallAnalyticsProps {
  subjects: Subject[]
  subjectTotalTime: Record<string, number>
  dailyStudyTime: Record<string, number>
  studentRankings: StudentRanking[]
  startDate: string
  endDate: string
}

export function OverallAnalytics({
  subjects,
  subjectTotalTime,
  dailyStudyTime,
  studentRankings,
  startDate,
  endDate,
}: OverallAnalyticsProps) {
  // 과목별 공부 시간 차트 데이터
  const subjectChartData = Object.entries(subjectTotalTime)
    .map(([name, minutes]) => ({
      name,
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
    }))
    .sort((a, b) => b.minutes - a.minutes)

  // 날짜 범위 생성
  const start = parseISO(startDate)
  const end = parseISO(endDate)

  // 날짜 범위의 모든 날짜 생성
  const dateRange = eachDayOfInterval({ start, end })

  // 일별 공부 시간 차트 데이터
  const dailyChartData = dateRange.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const minutes = dailyStudyTime[dateStr] || 0
    return {
      date: format(date, "M/d", { locale: ko }),
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
    }
  })

  // 학생 랭킹 차트 데이터 (상위 10명)
  const studentRankingData = studentRankings.slice(0, 10).map((student) => ({
    name: student.name,
    minutes: student.totalMinutes,
    hours: Math.round((student.totalMinutes / 60) * 10) / 10,
  }))

  // 총 공부 시간 계산
  const totalStudyMinutes = Object.values(dailyStudyTime).reduce((sum, minutes) => sum + minutes, 0)
  const totalStudyHours = Math.floor(totalStudyMinutes / 60)
  const remainingMinutes = totalStudyMinutes % 60

  // 일평균 공부 시간 계산
  const daysWithStudy = Object.keys(dailyStudyTime).length
  const averageMinutesPerDay = daysWithStudy > 0 ? Math.round(totalStudyMinutes / daysWithStudy) : 0
  const averageHours = Math.floor(averageMinutesPerDay / 60)
  const averageMinutes = averageMinutesPerDay % 60

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 공부 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStudyHours}시간 {remainingMinutes}분
            </div>
            <p className="text-xs text-muted-foreground">모든 학생의 총 공부 시간</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">일평균 공부 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageHours}시간 {averageMinutes}분
            </div>
            <p className="text-xs text-muted-foreground">학생들의 일평균 공부 시간</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">공부한 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentRankings.length}명</div>
            <p className="text-xs text-muted-foreground">공부 시간을 기록한 학생 수</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>과목별 총 공부 시간</CardTitle>
            <CardDescription>과목별 누적 공부 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}분 (${Math.round((Number(value) / 60) * 10) / 10}시간)`,
                      "공부 시간",
                    ]}
                    labelFormatter={(value) => `${value} 과목`}
                  />
                  <Bar dataKey="minutes" name="공부 시간(분)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>일별 총 공부 시간</CardTitle>
            <CardDescription>날짜별 누적 공부 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}분 (${Math.round((Number(value) / 60) * 10) / 10}시간)`,
                      "공부 시간",
                    ]}
                    labelFormatter={(value) => `${value}일`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="minutes" name="공부 시간(분)" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학생별 공부 시간 랭킹</CardTitle>
          <CardDescription>상위 10명의 학생 공부 시간</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentRankingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}분 (${Math.round((Number(value) / 60) * 10) / 10}시간)`,
                    "공부 시간",
                  ]}
                />
                <Bar dataKey="minutes" name="공부 시간(분)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
