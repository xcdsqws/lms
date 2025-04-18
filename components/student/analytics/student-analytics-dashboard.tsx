"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Download, AlertCircle } from "lucide-react"
import { getStudentLearningStats, generateStudentLearningReport } from "@/actions/student-analytics-actions"
import { StudyTimeSummary } from "@/components/student/analytics/study-time-summary"
import { SubjectTimeChart } from "@/components/student/analytics/subject-time-chart"
import { DailyStudyChart } from "@/components/student/analytics/daily-study-chart"
import { SelfEvaluationChart } from "@/components/student/analytics/self-evaluation-chart"
import { StudyLogList } from "@/components/student/analytics/study-log-list"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StudentAnalyticsDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "3months">("month")
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const fetchAnalytics = useCallback(
    async (page = 1) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getStudentLearningStats(period, { page, pageSize })
        if (data.error) {
          setError(data.error)
        } else {
          setAnalyticsData(data)
        }
      } catch (err) {
        console.error("학습 통계 조회 오류:", err)
        setError("학습 통계를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    },
    [period, pageSize],
  )

  useEffect(() => {
    fetchAnalytics(1)
    setCurrentPage(1)
  }, [period, fetchAnalytics])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchAnalytics(page)
  }

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true)
    try {
      const report = await generateStudentLearningReport(period)
      if (report.error) {
        console.error("리포트 생성 오류:", report.error)
        return
      }

      // 리포트 데이터를 JSON 형식으로 변환
      const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
      const reportUrl = URL.createObjectURL(reportBlob)

      // 다운로드 링크 생성 및 클릭
      const downloadLink = document.createElement("a")
      downloadLink.href = reportUrl
      downloadLink.download = `학습_리포트_${format(new Date(), "yyyy-MM-dd")}.json`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // URL 객체 해제
      URL.revokeObjectURL(reportUrl)
    } catch (err) {
      console.error("리포트 생성 중 오류:", err)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // 메모이제이션된 차트 데이터
  const chartData = useMemo(() => {
    if (!analyticsData) return null

    return {
      subjectTotalTime: analyticsData.subjectTotalTime || {},
      dailyChartData: analyticsData.dailyChartData || [],
      evaluationTrends: analyticsData.evaluationTrends || [],
    }
  }, [analyticsData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => fetchAnalytics(1)} className="mt-4 ml-auto">
          다시 시도
        </Button>
      </Alert>
    )
  }

  if (!analyticsData || !analyticsData.summary) {
    return (
      <Alert variant="default" className="bg-muted/50">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>학습 데이터가 없습니다. 공부 기록을 시작해보세요!</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={period} onValueChange={(value) => setPeriod(value as "week" | "month" | "3months")}>
          <TabsList>
            <TabsTrigger value="week">최근 1주일</TabsTrigger>
            <TabsTrigger value="month">최근 1개월</TabsTrigger>
            <TabsTrigger value="3months">최근 3개월</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" onClick={handleGenerateReport} disabled={isGeneratingReport}>
          {isGeneratingReport ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              리포트 생성 중...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              리포트 다운로드
            </>
          )}
        </Button>
      </div>

      <StudyTimeSummary summary={analyticsData.summary} />

      <div className="grid gap-6 md:grid-cols-2">
        {chartData && (
          <>
            <SubjectTimeChart subjectTotalTime={chartData.subjectTotalTime} />
            <DailyStudyChart dailyChartData={chartData.dailyChartData} />
          </>
        )}
      </div>

      {chartData && chartData.evaluationTrends.length > 0 && (
        <SelfEvaluationChart evaluationTrends={chartData.evaluationTrends} />
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">공부 기록</TabsTrigger>
          <TabsTrigger value="time">공부 시간 기록</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="space-y-4">
          <StudyLogList
            studyLogs={analyticsData.studyLogs || []}
            pagination={analyticsData.pagination}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>공부 시간 기록</CardTitle>
              <CardDescription>
                {format(parseISO(analyticsData.dateRange.start), "PPP", { locale: ko })} ~{" "}
                {format(parseISO(analyticsData.dateRange.end), "PPP", { locale: ko })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.studyTimeLogs && analyticsData.studyTimeLogs.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left">날짜</th>
                          <th className="p-2 text-left">과목</th>
                          <th className="p-2 text-left">공부 시간</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.studyTimeLogs.map((log: any) => (
                          <tr key={log.id} className="border-b">
                            <td className="p-2">{format(parseISO(log.study_date), "PPP", { locale: ko })}</td>
                            <td className="p-2">{log.subjects?.name || "알 수 없음"}</td>
                            <td className="p-2">
                              {Math.floor(log.duration_minutes / 60) > 0
                                ? `${Math.floor(log.duration_minutes / 60)}시간 `
                                : ""}
                              {log.duration_minutes % 60}분
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Alert variant="default" className="bg-muted/50">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      기록된 공부 시간이 없습니다. 공부 시간을 측정하면 여기에 표시됩니다.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
