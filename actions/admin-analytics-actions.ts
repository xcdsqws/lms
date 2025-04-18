"use server"

import { createClient } from "@/lib/supabase/server"
import { format, subDays } from "date-fns"

// 모든 학생 목록 가져오기
export async function getAllStudents() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, school, grade, class_number, student_number")
    .eq("role", "student")
    .order("full_name")

  if (error) {
    console.error("학생 목록 조회 오류:", error)
    return { error: "학생 목록을 조회하는 중 오류가 발생했습니다." }
  }

  return { data }
}

// 특정 학생의 학습 통계 가져오기
export async function getStudentLearningStats(studentId: string) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." }
  }

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

  // 최근 30일 날짜 생성
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)
  const startDate = format(thirtyDaysAgo, "yyyy-MM-dd")
  const endDate = format(today, "yyyy-MM-dd")

  // 최근 30일간 공부 시간 로그 가져오기
  const { data: studyTimeLogs, error: timeLogsError } = await supabase
    .from("study_time_logs")
    .select("*, subjects(name)")
    .eq("student_id", studentId)
    .gte("study_date", startDate)
    .lte("study_date", endDate)
    .order("study_date", { ascending: true })

  if (timeLogsError) {
    console.error("공부 시간 로그 조회 오류:", timeLogsError)
    return { error: "공부 시간 로그를 조회하는 중 오류가 발생했습니다." }
  }

  // 최근 30일간 자기평가 가져오기
  const { data: selfEvaluations, error: evaluationsError } = await supabase
    .from("self_evaluations")
    .select("*")
    .eq("student_id", studentId)
    .gte("evaluation_date", startDate)
    .lte("evaluation_date", endDate)
    .order("evaluation_date", { ascending: true })

  if (evaluationsError) {
    console.error("자기평가 조회 오류:", evaluationsError)
    return { error: "자기평가를 조회하는 중 오류가 발생했습니다." }
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

  // 자기평가 평균 계산
  const evaluationAverages =
    selfEvaluations.length > 0
      ? {
          satisfaction:
            selfEvaluations.reduce((sum, eval) => sum + eval.satisfaction_level, 0) / selfEvaluations.length,
          achievement: selfEvaluations.reduce((sum, eval) => sum + eval.achievement_level, 0) / selfEvaluations.length,
          focus: selfEvaluations.reduce((sum, eval) => sum + eval.focus_level, 0) / selfEvaluations.length,
        }
      : null

  return {
    student,
    subjectTotalTime,
    dailyStudyTime,
    evaluationAverages,
    studyTimeLogs,
    selfEvaluations,
  }
}

// 전체 학습 통계 가져오기
export async function getOverallLearningStats() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "관리자 권한이 필요합니다." }
  }

  // 최근 30일 날짜 생성
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)
  const startDate = format(thirtyDaysAgo, "yyyy-MM-dd")
  const endDate = format(today, "yyyy-MM-dd")

  // 과목 목록 가져오기
  const { data: subjects, error: subjectsError } = await supabase.from("subjects").select("*")

  if (subjectsError) {
    console.error("과목 목록 조회 오류:", subjectsError)
    return { error: "과목 목록을 조회하는 중 오류가 발생했습니다." }
  }

  // 최근 30일간 모든 학생의 공부 시간 로그 가져오기
  const { data: studyTimeLogs, error: timeLogsError } = await supabase
    .from("study_time_logs")
    .select("*, subjects(name), profiles(full_name)")
    .gte("study_date", startDate)
    .lte("study_date", endDate)

  if (timeLogsError) {
    console.error("공부 시간 로그 조회 오류:", timeLogsError)
    return { error: "공부 시간 로그를 조회하는 중 오류가 발생했습니다." }
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

  // 학생별 총 공부 시간 계산
  const studentTotalTime = studyTimeLogs.reduce(
    (acc, log) => {
      const studentName = (log.profiles as any)?.full_name || "알 수 없음"
      const studentId = log.student_id

      if (!acc[studentId]) {
        acc[studentId] = {
          name: studentName,
          totalMinutes: 0,
        }
      }
      acc[studentId].totalMinutes += log.duration_minutes
      return acc
    },
    {} as Record<string, { name: string; totalMinutes: number }>,
  )

  // 학생별 공부 시간 순위 계산
  const studentRankings = Object.entries(studentTotalTime)
    .map(([id, data]) => ({
      id,
      name: data.name,
      totalMinutes: data.totalMinutes,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)

  return {
    subjects,
    subjectTotalTime,
    dailyStudyTime,
    studentRankings,
    studyTimeLogs,
  }
}
