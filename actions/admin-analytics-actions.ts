"use server"

import { createClient } from "@/lib/supabase/server"
import { format, subDays } from "date-fns"

export async function getAdminAnalyticsData() {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
      data: null,
    }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return {
      success: false,
      message: "관리자 권한이 필요합니다.",
      data: null,
    }
  }

  try {
    // 최근 30일 날짜 범위
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    const startDate = format(thirtyDaysAgo, "yyyy-MM-dd")
    const endDate = format(today, "yyyy-MM-dd")

    // 총 사용자 수
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // 총 학생 수
    const { count: totalStudents } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")

    // 총 과목 수
    const { count: totalSubjects } = await supabase.from("subjects").select("*", { count: "exact", head: true })

    // 총 과제 수
    const { count: totalAssignments } = await supabase.from("assignments").select("*", { count: "exact", head: true })

    // 최근 30일간 공부 시간 로그
    const { data: studyTimeLogs } = await supabase
      .from("study_time_logs")
      .select("*, subjects(name)")
      .gte("study_date", startDate)
      .lte("study_date", endDate)

    // 최근 30일간 자기평가
    const { data: selfEvaluations } = await supabase
      .from("self_evaluations")
      .select("*")
      .gte("evaluation_date", startDate)
      .lte("evaluation_date", endDate)

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
        : null

    return {
      success: true,
      message: "분석 데이터를 성공적으로 가져왔습니다.",
      data: {
        totalUsers,
        totalStudents,
        totalSubjects,
        totalAssignments,
        studyTimeLogs: studyTimeLogs || [],
        selfEvaluations: selfEvaluations || [],
        evaluationAverages,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    }
  } catch (error) {
    console.error("[GET_ADMIN_ANALYTICS_DATA]", error)
    return {
      success: false,
      message: "분석 데이터를 가져오는 중 오류가 발생했습니다.",
      data: null,
    }
  }
}

// 특정 학생의 학습 통계 가져오기
export async function getStudentLearningStats(studentId: string) {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      success: false,
      message: "인증되지 않은 사용자입니다.",
      data: null,
    }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return {
      success: false,
      message: "관리자 권한이 필요합니다.",
      data: null,
    }
  }

  try {
    // 최근 30일 날짜 범위
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    const startDate = format(thirtyDaysAgo, "yyyy-MM-dd")
    const endDate = format(today, "yyyy-MM-dd")

    // 학생 정보 가져오기
    const { data: student } = await supabase.from("profiles").select("*").eq("id", studentId).single()

    if (!student) {
      return {
        success: false,
        message: "학생을 찾을 수 없습니다.",
        data: null,
      }
    }

    // 학생의 공부 시간 로그 가져오기
    const { data: studyTimeLogs } = await supabase
      .from("study_time_logs")
      .select("*, subjects(name)")
      .eq("student_id", studentId)
      .gte("study_date", startDate)
      .lte("study_date", endDate)

    // 학생의 자기평가 가져오기
    const { data: selfEvaluations } = await supabase
      .from("self_evaluations")
      .select("*")
      .eq("student_id", studentId)
      .gte("evaluation_date", startDate)
      .lte("evaluation_date", endDate)

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
        : null

    return {
      success: true,
      message: "학생 학습 통계를 성공적으로 가져왔습니다.",
      data: {
        student,
        studyTimeLogs: studyTimeLogs || [],
        selfEvaluations: selfEvaluations || [],
        subjectTotalTime,
        dailyStudyTime,
        evaluationAverages,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    }
  } catch (error) {
    console.error("[GET_STUDENT_LEARNING_STATS]", error)
    return {
      success: false,
      message: "학생 학습 통계를 가져오는 중 오류가 발생했습니다.",
      data: null,
    }
  }
}
