"use server"

import { createClient } from "@/lib/supabase/server"
import { format, subDays, parseISO, eachDayOfInterval } from "date-fns"

// 페이지네이션을 위한 타입 정의
type PaginationParams = {
  page?: number
  pageSize?: number
}

// 학생 자신의 학습 통계 가져오기
export async function getStudentLearningStats(
  period: "week" | "month" | "3months" = "month",
  pagination?: PaginationParams,
) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  const studentId = session.user.id

  // 기간에 따른 날짜 범위 설정
  const today = new Date()
  let startDate: Date

  switch (period) {
    case "week":
      startDate = subDays(today, 7)
      break
    case "3months":
      startDate = subDays(today, 90)
      break
    case "month":
    default:
      startDate = subDays(today, 30)
      break
  }

  const formattedStartDate = format(startDate, "yyyy-MM-dd")
  const formattedEndDate = format(today, "yyyy-MM-dd")

  try {
    // 학생 정보 가져오기
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", studentId)
      .single()

    if (studentError) {
      console.error("학생 정보 조회 오류:", studentError)
      return { error: "학생 정보를 조회하는 중 오류가 발생했습니다." }
    }

    // 과목 목록 가져오기
    const { data: subjects, error: subjectsError } = await supabase.from("subjects").select("*")

    if (subjectsError) {
      console.error("과목 목록 조회 오류:", subjectsError)
      return { error: "과목 목록을 조회하는 중 오류가 발생했습니다." }
    }

    // 기간 내 공부 시간 로그 가져오기
    const { data: studyTimeLogs, error: timeLogsError } = await supabase
      .from("study_time_logs")
      .select("*, subjects(name)")
      .eq("student_id", studentId)
      .gte("study_date", formattedStartDate)
      .lte("study_date", formattedEndDate)
      .order("study_date", { ascending: true })

    if (timeLogsError) {
      console.error("공부 시간 로그 조회 오류:", timeLogsError)
      return { error: "공부 시간 로그를 조회하는 중 오류가 발생했습니다." }
    }

    // 기간 내 자기평가 가져오기
    const { data: selfEvaluations, error: evaluationsError } = await supabase
      .from("self_evaluations")
      .select("*")
      .eq("student_id", studentId)
      .gte("evaluation_date", formattedStartDate)
      .lte("evaluation_date", formattedEndDate)
      .order("evaluation_date", { ascending: true })

    if (evaluationsError) {
      console.error("자기평가 조회 오류:", evaluationsError)
      return { error: "자기평가를 조회하는 중 오류가 발생했습니다." }
    }

    // 기간 내 공부 기록 가져오기 (페이지네이션 적용)
    const page = pagination?.page || 1
    const pageSize = pagination?.pageSize || 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const {
      data: studyLogs,
      error: logsError,
      count: totalLogs,
    } = await supabase
      .from("study_logs")
      .select("*, subjects(name)", { count: "exact" })
      .eq("student_id", studentId)
      .gte("study_date", formattedStartDate)
      .lte("study_date", formattedEndDate)
      .order("study_date", { ascending: false })
      .range(from, to)

    if (logsError) {
      console.error("공부 기록 조회 오류:", logsError)
      return { error: "공부 기록을 조회하는 중 오류가 발생했습니다." }
    }

    // 과목별 총 공부 시간 계산
    const subjectTotalTime = studyTimeLogs.reduce(
      (acc, log) => {
        const subjectName = log.subjects?.name || "알 수 없음"
        if (!acc[subjectName]) {
          acc[subjectName] = 0
        }
        acc[subjectName] += log.duration_minutes
        return acc
      },
      {} as Record<string, number>,
    )

    // 일별 총 공부 시간 계산
    const dailyStudyTime = studyTimeLogs.reduce(
      (acc, log) => {
        const date = log.study_date
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += log.duration_minutes
        return acc
      },
      {} as Record<string, number>,
    )

    // 날짜 범위의 모든 날짜 생성
    const dateRange = eachDayOfInterval({ start: startDate, end: today })
    const dailyChartData = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const minutes = dailyStudyTime[dateStr] || 0
      return {
        date: dateStr,
        formattedDate: format(date, "M/d"),
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      }
    })

    // 자기평가 평균 계산
    const evaluationAverages =
      selfEvaluations.length > 0
        ? {
            satisfaction:
              selfEvaluations.reduce((sum, eval) => sum + eval.satisfaction_level, 0) / selfEvaluations.length,
            achievement:
              selfEvaluations.reduce((sum, eval) => sum + eval.achievement_level, 0) / selfEvaluations.length,
            focus: selfEvaluations.reduce((sum, eval) => sum + eval.focus_level, 0) / selfEvaluations.length,
          }
        : null

    // 자기평가 추이 데이터 생성
    const evaluationTrends = selfEvaluations.map((eval) => ({
      date: eval.evaluation_date,
      formattedDate: format(parseISO(eval.evaluation_date), "M/d"),
      satisfaction: eval.satisfaction_level,
      achievement: eval.achievement_level,
      focus: eval.focus_level,
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

    // 가장 많이 공부한 과목
    const mostStudiedSubject = Object.entries(subjectTotalTime).sort((a, b) => b[1] - a[1])[0] || ["없음", 0]

    // 가장 많이 공부한 날짜
    const mostStudiedDay = Object.entries(dailyStudyTime).sort((a, b) => b[1] - a[1])[0] || ["없음", 0]

    // 학습 요약 통계
    const summary = {
      totalStudyTime: {
        hours: totalStudyHours,
        minutes: remainingMinutes,
        totalMinutes: totalStudyMinutes,
      },
      averageStudyTime: {
        hours: averageHours,
        minutes: averageMinutes,
        totalMinutes: averageMinutesPerDay,
      },
      daysStudied: daysWithStudy,
      totalDays: dateRange.length,
      studyRate: daysWithStudy > 0 ? Math.round((daysWithStudy / dateRange.length) * 100) : 0,
      mostStudiedSubject: {
        name: mostStudiedSubject[0],
        minutes: mostStudiedSubject[1] as number,
        hours: Math.floor((mostStudiedSubject[1] as number) / 60),
        remainingMinutes: (mostStudiedSubject[1] as number) % 60,
      },
      mostStudiedDay: {
        date: mostStudiedDay[0],
        formattedDate: mostStudiedDay[0] !== "없음" ? format(parseISO(mostStudiedDay[0]), "M/d") : "없음",
        minutes: mostStudiedDay[1] as number,
        hours: Math.floor((mostStudiedDay[1] as number) / 60),
        remainingMinutes: (mostStudiedDay[1] as number) % 60,
      },
    }

    return {
      student,
      subjects,
      subjectTotalTime,
      dailyStudyTime,
      dailyChartData,
      evaluationAverages,
      evaluationTrends,
      studyTimeLogs,
      selfEvaluations,
      studyLogs,
      pagination: {
        page,
        pageSize,
        totalItems: totalLogs || 0,
        totalPages: Math.ceil((totalLogs || 0) / pageSize),
      },
      summary,
      period,
      dateRange: {
        start: formattedStartDate,
        end: formattedEndDate,
      },
    }
  } catch (error) {
    console.error("학습 통계 조회 오류:", error)
    return { error: "학습 통계를 조회하는 중 오류가 발생했습니다." }
  }
}
