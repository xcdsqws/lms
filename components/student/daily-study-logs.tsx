"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface StudyLog {
  id: string
  content: string
  study_date: string
  subject_id: string
  subjects: {
    name: string
  }
}

interface StudyTimeLog {
  id: string
  duration_minutes: number
  study_date: string
  subject_id: string
  subjects: {
    name: string
  }
}

interface SelfEvaluation {
  id: string
  satisfaction_level: number
  achievement_level: number
  focus_level: number
  reflection: string | null
  goals_for_tomorrow: string | null
  evaluation_date: string
}

interface DailyStudyLogsProps {
  userId: string
}

export function DailyStudyLogs({ userId }: DailyStudyLogsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([])
  const [studyTimeLogs, setStudyTimeLogs] = useState<StudyTimeLog[]>([])
  const [selfEvaluation, setSelfEvaluation] = useState<SelfEvaluation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // 날짜가 변경될 때마다 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const formattedDate = format(selectedDate, "yyyy-MM-dd")

      try {
        // 공부 기록 가져오기
        const { data: logs, error: logsError } = await supabase
          .from("study_logs")
          .select("*, subjects(name)")
          .eq("student_id", userId)
          .eq("study_date", formattedDate)

        if (logsError) throw logsError
        setStudyLogs(logs as StudyLog[])

        // 공부 시간 가져오기
        const { data: timeLogs, error: timeLogsError } = await supabase
          .from("study_time_logs")
          .select("*, subjects(name)")
          .eq("student_id", userId)
          .eq("study_date", formattedDate)

        if (timeLogsError) throw timeLogsError
        setStudyTimeLogs(timeLogs as StudyTimeLog[])

        // 자기평가 가져오기
        const { data: evaluation, error: evaluationError } = await supabase
          .from("self_evaluations")
          .select("*")
          .eq("student_id", userId)
          .eq("evaluation_date", formattedDate)
          .single()

        if (evaluationError && evaluationError.code !== "PGRST116") {
          throw evaluationError
        }
        setSelfEvaluation(evaluation as SelfEvaluation)
      } catch (error) {
        console.error("Error fetching study data:", error)
        toast({
          title: "데이터 로드 오류",
          description: "학습 기록을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedDate, userId, supabase, toast])

  // 평가 점수를 별점으로 표시
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-lg ${i < rating ? "text-yellow-500" : "text-gray-300"}`}>
            ★
          </span>
        ))}
      </div>
    )
  }

  // 총 공부 시간 계산
  const totalStudyMinutes = studyTimeLogs.reduce((total, log) => total + log.duration_minutes, 0)
  const hours = Math.floor(totalStudyMinutes / 60)
  const minutes = totalStudyMinutes % 60

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
            <CardDescription>기록을 확인할 날짜를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={ko}
              disabled={{ after: new Date() }}
            />
          </CardContent>
        </Card>

        <Card className="md:w-2/3">
          <CardHeader>
            <CardTitle>{format(selectedDate, "PPP (EEEE)", { locale: ko })} 학습 요약</CardTitle>
            <CardDescription>선택한 날짜의 학습 기록 요약</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">공부한 과목</div>
                    <div className="text-2xl font-bold mt-1">
                      {new Set(studyLogs.map((log) => log.subject_id)).size}개
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">총 공부 시간</div>
                    <div className="text-2xl font-bold mt-1">
                      {hours > 0 ? `${hours}시간 ` : ""}
                      {minutes}분
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">기록 수</div>
                    <div className="text-2xl font-bold mt-1">{studyLogs.length}개</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">공부 기록</TabsTrigger>
          <TabsTrigger value="time">공부 시간</TabsTrigger>
          <TabsTrigger value="evaluation">자기평가</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : studyLogs.length > 0 ? (
            <div className="space-y-4">
              {studyLogs.map((log) => (
                <Card key={log.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{log.subjects.name}</CardTitle>
                    <CardDescription>{format(parseISO(log.study_date), "PPP", { locale: ko })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{log.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                선택한 날짜에 기록된 공부 내용이 없습니다.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : studyTimeLogs.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>과목별 공부 시간</CardTitle>
                <CardDescription>
                  총 공부 시간: {hours > 0 ? `${hours}시간 ` : ""}
                  {minutes}분
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(
                    studyTimeLogs.reduce((acc, log) => {
                      const subjectName = log.subjects.name
                      if (!acc.has(subjectName)) {
                        acc.set(subjectName, 0)
                      }
                      acc.set(subjectName, acc.get(subjectName)! + log.duration_minutes)
                      return acc
                    }, new Map<string, number>()),
                  ).map(([subject, duration]) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="font-medium">{subject}</span>
                      <span>
                        {Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)}시간 ` : ""}
                        {duration % 60}분
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                선택한 날짜에 기록된 공부 시간이 없습니다.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selfEvaluation ? (
            <Card>
              <CardHeader>
                <CardTitle>자기평가</CardTitle>
                <CardDescription>
                  {format(parseISO(selfEvaluation.evaluation_date), "PPP", { locale: ko })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">만족도</h4>
                    {renderRating(selfEvaluation.satisfaction_level)}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">성취도</h4>
                    {renderRating(selfEvaluation.achievement_level)}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">집중도</h4>
                    {renderRating(selfEvaluation.focus_level)}
                  </div>
                </div>

                {selfEvaluation.reflection && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">학습 성찰</h4>
                    <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">{selfEvaluation.reflection}</p>
                  </div>
                )}

                {selfEvaluation.goals_for_tomorrow && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">다음 날 목표</h4>
                    <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">{selfEvaluation.goals_for_tomorrow}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                선택한 날짜에 기록된 자기평가가 없습니다.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
