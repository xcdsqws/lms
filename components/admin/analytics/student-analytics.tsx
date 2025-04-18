"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { format, eachDayOfInterval, subDays } from "date-fns"
import { ko } from "date-fns/locale"
import { getStudentLearningStats } from "@/actions/admin-analytics-actions"
import { Loader2 } from "lucide-react"

interface Student {
  id: string
  full_name: string
  username: string
  school: string | null
  grade: number | null
  class_number: number | null
}

interface StudentAnalyticsProps {
  students: Student[]
}

export function StudentAnalytics({ students }: StudentAnalyticsProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [studentData, setStudentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudent(studentId)
    setIsLoading(true)

    try {
      const data = await getStudentLearningStats(studentId)
      setStudentData(data)
    } catch (error) {
      console.error("Error fetching student data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 학생 정보 표시
  const renderStudentInfo = () => {
    if (!studentData || !studentData.student) return null

    const student = studentData.student
    return (
      <Card>
        <CardHeader>
          <CardTitle>학생 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">이름</p>
              <p>{student.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">이메일</p>
              <p>{student.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">학교</p>
              <p>{student.school || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">학년/반</p>
              <p>
                {student.grade ? `${student.grade}학년` : "-"}
                {student.class_number ? ` ${student.class_number}반` : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 과목별 공부 시간 차트
  const renderSubjectTimeChart = () => {
    if (!studentData || !studentData.subjectTotalTime) return null

    const chartData = Object.entries(studentData.subjectTotalTime)
      .map(([name, minutes]) => ({
        name,
        minutes: minutes as number,
        hours: Math.round(((minutes as number) / 60) * 10) / 10,
      }))
      .sort((a, b) => b.minutes - a.minutes)

    return (
      <Card>
        <CardHeader>
          <CardTitle>과목별 공부 시간</CardTitle>
          <CardDescription>최근 30일간 과목별 누적 공부 시간</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
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
    )
  }

  // 일별 공부 시간 차트
  const renderDailyTimeChart = () => {
    if (!studentData || !studentData.dailyStudyTime) return null

    // 최근 30일 날짜 범위 생성
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today })

    // 일별 공부 시간 차트 데이터
    const chartData = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const minutes = studentData.dailyStudyTime[dateStr] || 0
      return {
        date: format(date, "M/d", { locale: ko }),
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      }
    })

    return (
      <Card>
        <CardHeader>
          <CardTitle>일별 공부 시간</CardTitle>
          <CardDescription>최근 30일간 일별 공부 시간</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
    )
  }

  // 자기평가 평균 차트
  const renderEvaluationChart = () => {
    if (!studentData || !studentData.evaluationAverages) return null

    const { satisfaction, achievement, focus } = studentData.evaluationAverages

    const chartData = [
      { name: "만족도", value: satisfaction },
      { name: "성취도", value: achievement },
      { name: "집중도", value: focus },
    ]

    return (
      <Card>
        <CardHeader>
          <CardTitle>자기평가 평균</CardTitle>
          <CardDescription>최근 30일간 자기평가 평균 점수</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => [`${Math.round(Number(value) * 100) / 100}점`, "평균 점수"]} />
                <Bar dataKey="value" name="평균 점수" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 총 공부 시간 및 통계
  const renderStudyTimeStats = () => {
    if (!studentData || !studentData.dailyStudyTime) return null

    // 총 공부 시간 계산
    const totalMinutes = Object.values(studentData.dailyStudyTime).reduce(
      (sum, minutes) => sum + (minutes as number),
      0,
    )
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    // 일평균 공부 시간 계산
    const daysWithStudy = Object.keys(studentData.dailyStudyTime).length
    const averageMinutesPerDay = daysWithStudy > 0 ? Math.round(totalMinutes / daysWithStudy) : 0
    const averageHours = Math.floor(averageMinutesPerDay / 60)
    const averageMinutes = averageMinutesPerDay % 60

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 공부 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHours}시간 {remainingMinutes}분
            </div>
            <p className="text-xs text-muted-foreground">최근 30일간 총 공부 시간</p>
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
            <p className="text-xs text-muted-foreground">공부한 날의 평균 공부 시간</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>학생 선택</CardTitle>
          <CardDescription>분석할 학생을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={handleStudentChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="학생 선택" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name} {student.grade && `(${student.grade}학년`}
                  {student.class_number && ` ${student.class_number}반)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : selectedStudent && studentData ? (
        <>
          {renderStudentInfo()}
          {renderStudyTimeStats()}
          <div className="grid gap-4 md:grid-cols-2">
            {renderSubjectTimeChart()}
            {renderDailyTimeChart()}
          </div>
          {renderEvaluationChart()}
        </>
      ) : selectedStudent ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            학생 데이터를 불러오는 중 오류가 발생했습니다.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            학생을 선택하면 상세 분석 정보가 표시됩니다.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
