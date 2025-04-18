"use server"

import { createClient } from "@/lib/supabase/server"
import { format, parseISO, subDays } from "date-fns"
import { ko } from "date-fns/locale"

// 학생 학습 통계 가져오기
export async function getStudentLearningStats(
  period: "week" | "month" | "3months" = "month",
  pagination = { page: 1, pageSize: 10 },
) {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  try {
    // 날짜 범위 계산
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

    // 학생 정보 가져오기
    const { data: student } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // 과목 목록 가져오기
    const { data: subjects } = await supabase.from("subjects").select("*")

    // 공부 시간 로그 가져오기
    const { data: studyTimeLogs } = await supabase
      .from("study_time_logs")
      .select("*, subjects(name)")
      .eq("student_id", session.user.id)
      .gte("study_date", formattedStartDate)
      .lte("study_date", formattedEndDate)
      .order("study_date", { ascending: false })

    // 자기평가 가져오기
    const { data: selfEvaluations } = await supabase
      .from("self_evaluations")
      .select("*")
      .eq("student_id", session.user.id)
      .gte("evaluation_date", formattedStartDate)
      .lte("evaluation_date", formattedEndDate)
      .order("evaluation_date", { ascending: false })

    // 공부 기록 가져오기 (페이지네이션 적용)
    const from = (pagination.page - 1) * pagination.pageSize
    const to = from + pagination.pageSize - 1

    const { data: studyLogs, count: totalStudyLogs } = await supabase
      .from("study_logs")
      .select("*, subjects(name)", { count: "exact" })
      .eq("student_id", session.user.id)
      .gte("study_date", formattedStartDate)
      .lte("study_date", formattedEndDate)
      .order("study_date", { ascending: false })
      .range(from, to)

    // 과목별 총 공부 시간 계산
    const subjectTotalTime = (studyTimeLogs || []).reduce(
      (acc, log) => {
        const subjectName = log.subjects?.name || "Unknown"
        acc[subjectName] = (acc[subjectName] || 0) + log.duration_minutes
        return acc
      },
      {} as { [subject: string]: number },
    )

    // 일별 총 공부 시간 계산
    const dailyStudyTime = (studyTimeLogs || []).reduce(
      (acc, log) => {
        acc[log.study_date] = (acc[log.study_date] || 0) + log.duration_minutes
        return acc
      },
      {} as { [date: string]: number },
    )

    // 일별 차트 데이터 생성
    const dailyChartData = Object.entries(dailyStudyTime)
      .map(([date, minutes]) => ({
        date,
        formattedDate: format(parseISO(date), "M/d", { locale: ko }),
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 자기평가 평균 계산
    const evaluationAverages =
      selfEvaluations && selfEvaluations.length > 0
        ? {
            satisfaction:
              selfEvaluations.reduce((sum, evaluation) => sum + evaluation.satisfaction_level, 0) /
              selfEvaluations.length,
            achievement:
              selfEvaluations.reduce((sum, evaluation) => sum + evaluation.achievement_level, 0) /
              selfEvaluations.length,
            focus:
              selfEvaluations.reduce((sum, evaluation) => sum + evaluation.focus_level, 0) / selfEvaluations.length,
          }
        : { satisfaction: 0, achievement: 0, focus: 0 }

    // 자기평가 추이 데이터 생성
    const evaluationTrends = (selfEvaluations || [])
      .map((evaluation) => ({
        date: evaluation.evaluation_date,
        formattedDate: format(parseISO(evaluation.evaluation_date), "M/d", { locale: ko }),
        satisfaction: evaluation.satisfaction_level,
        achievement: evaluation.achievement_level,
        focus: evaluation.focus_level,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 총 공부 시간 계산
    const totalMinutes = Object.values(dailyStudyTime).reduce((sum, minutes) => sum + minutes, 0)
    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60

    // 일평균 공부 시간 계산
    const daysWithStudy = Object.keys(dailyStudyTime).length
    const averageMinutesPerDay = daysWithStudy > 0 ? Math.round(totalMinutes / daysWithStudy) : 0
    const averageHours = Math.floor(averageMinutesPerDay / 60)
    const averageMinutes = averageMinutesPerDay % 60

    // 가장 많이 공부한 과목 찾기
    let mostStudiedSubject = { name: "", minutes: 0 }
    Object.entries(subjectTotalTime).forEach(([name, minutes]) => {
      if (minutes > mostStudiedSubject.minutes) {
        mostStudiedSubject = { name, minutes }
      }
    })

    // 가장 많이 공부한 날 찾기
    let mostStudiedDay = { date: "", minutes: 0 }
    Object.entries(dailyStudyTime).forEach(([date, minutes]) => {
      if (minutes > mostStudiedDay.minutes) {
        mostStudiedDay = { date, minutes }
      }
    })

    // 요약 정보 생성
    const summary = {
      totalStudyTime: {
        hours: totalHours,
        minutes: remainingMinutes,
        totalMinutes,
      },
      averageStudyTime: {
        hours: averageHours,
        minutes: averageMinutes,
        totalMinutes: averageMinutesPerDay,
      },
      daysStudied: daysWithStudy,
      totalDays: Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      studyRate:
        daysWithStudy > 0
          ? Math.round(
              (daysWithStudy / Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) * 100,
            )
          : 0,
      mostStudiedSubject: {
        name: mostStudiedSubject.name || "없음",
        minutes: mostStudiedSubject.minutes,
        hours: Math.floor(mostStudiedSubject.minutes / 60),
        remainingMinutes: mostStudiedSubject.minutes % 60,
      },
      mostStudiedDay: mostStudiedDay.date
        ? {
            date: mostStudiedDay.date,
            formattedDate: format(parseISO(mostStudiedDay.date), "M/d", { locale: ko }),
            minutes: mostStudiedDay.minutes,
            hours: Math.floor(mostStudiedDay.minutes / 60),
            remainingMinutes: mostStudiedDay.minutes % 60,
          }
        : null,
    }

    return {
      student,
      subjects,
      studyTimeLogs,
      selfEvaluations,
      studyLogs,
      subjectTotalTime,
      dailyStudyTime,
      dailyChartData,
      evaluationAverages,
      evaluationTrends,
      summary,
      period,
      dateRange: {
        start: formattedStartDate,
        end: formattedEndDate,
      },
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: totalStudyLogs || 0,
        totalPages: Math.ceil((totalStudyLogs || 0) / pagination.pageSize),
      },
    }
  } catch (error) {
    console.error("학습 통계 조회 오류:", error)
    return { error: "학습 통계를 불러오는 중 오류가 발생했습니다." }
  }
}

// 학생 학습 리포트 생성
export async function generateStudentLearningReport(period: "week" | "month" | "3months" = "month") {
  try {
    const stats = await getStudentLearningStats(period)

    if ("error" in stats) {
      return stats
    }

    return {
      ...stats,
      generatedAt: new Date().toISOString(),
      reportType: "학습 통계 리포트",
    }
  } catch (error) {
    console.error("학습 리포트 생성 오류:", error)
    return { error: "학습 리포트를 생성하는 중 오류가 발생했습니다." }
  }
}
