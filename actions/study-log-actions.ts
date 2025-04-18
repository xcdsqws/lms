"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 표준화된 에러 응답 타입 정의
type ErrorResponse = { error: string }
type SuccessResponse<T> = { success: true } & T
type ActionResponse<T = { message: string }> = SuccessResponse<T> | ErrorResponse

// 공부 기록 추가
export async function addStudyLog(subjectId: string, content: string): Promise<ActionResponse> {
  // 입력값 검증
  if (!subjectId || !content.trim()) {
    return { error: "과목과 내용을 모두 입력해주세요." }
  }

  // 내용 길이 제한 검증
  if (content.length > 5000) {
    return { error: "내용은 5000자를 초과할 수 없습니다." }
  }

  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  try {
    // 오늘 날짜
    const today = new Date().toISOString().split("T")[0]

    // 이미 오늘 해당 과목에 대한 기록이 있는지 확인
    const { data: existingLog, error: fetchError } = await supabase
      .from("study_logs")
      .select("id")
      .eq("student_id", session.user.id)
      .eq("subject_id", subjectId)
      .eq("study_date", today)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("기존 기록 조회 오류:", fetchError)
      return { error: "기존 기록을 조회하는 중 오류가 발생했습니다." }
    }

    if (existingLog) {
      // 기존 기록 업데이트
      const { error: updateError } = await supabase
        .from("study_logs")
        .update({
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLog.id)

      if (updateError) {
        console.error("기록 업데이트 오류:", updateError)
        return { error: "공부 기록을 업데이트하는 중 오류가 발생했습니다." }
      }

      revalidatePath("/student/study-log")
      return { success: true, message: "공부 기록이 업데이트되었습니다." }
    } else {
      // 새 기록 생성
      const { error: insertError } = await supabase.from("study_logs").insert({
        student_id: session.user.id,
        subject_id: subjectId,
        content: content,
        study_date: today,
      })

      if (insertError) {
        console.error("기록 생성 오류:", insertError)
        return { error: "공부 기록을 저장하는 중 오류가 발생했습니다." }
      }

      revalidatePath("/student/study-log")
      return { success: true, message: "공부 기록이 저장되었습니다." }
    }
  } catch (error) {
    console.error("공부 기록 저장 중 예외 발생:", error)
    return { error: "공부 기록을 저장하는 중 오류가 발생했습니다." }
  }
}

// 공부 시간 측정 시작
export async function startStudyTimeLog(subjectId: string): Promise<ActionResponse<{ logId: string }>> {
  // 입력값 검증
  if (!subjectId) {
    return { error: "과목을 선택해주세요." }
  }

  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  try {
    // 오늘 날짜
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    // 새 공부 시간 로그 생성
    const { data, error } = await supabase
      .from("study_time_logs")
      .insert({
        student_id: session.user.id,
        subject_id: subjectId,
        start_time: now,
        duration_minutes: 0, // 시작 시에는 0으로 설정
        study_date: today,
      })
      .select()
      .single()

    if (error) {
      console.error("공부 시간 로그 생성 오류:", error)
      return { error: "공부 시간 측정을 시작하는 중 오류가 발생했습니다." }
    }

    revalidatePath("/student/study-log")
    return { success: true, message: "공부 시간 측정이 시작되었습니다.", logId: data.id }
  } catch (error) {
    console.error("공부 시간 측정 시작 중 예외 발생:", error)
    return { error: "공부 시간 측정을 시작하는 중 오류가 발생했습니다." }
  }
}

// 공부 시간 측정 종료
export async function endStudyTimeLog(logId: string, durationMinutes: number): Promise<ActionResponse> {
  // 입력값 검증
  if (!logId) {
    return { error: "로그 ID가 필요합니다." }
  }

  if (durationMinutes <= 0) {
    return { error: "공부 시간은 0보다 커야 합니다." }
  }

  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  try {
    // 로그 소유자 확인
    const { data: timeLog, error: fetchError } = await supabase
      .from("study_time_logs")
      .select("student_id")
      .eq("id", logId)
      .single()

    if (fetchError) {
      console.error("공부 시간 로그 조회 오류:", fetchError)
      return { error: "공부 시간 로그를 조회하는 중 오류가 발생했습니다." }
    }

    if (timeLog.student_id !== session.user.id) {
      return { error: "권한이 없습니다." }
    }

    // 종료 시간 및 지속 시간 업데이트
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from("study_time_logs")
      .update({
        end_time: now,
        duration_minutes: durationMinutes,
      })
      .eq("id", logId)

    if (updateError) {
      console.error("공부 시간 로그 업데이트 오류:", updateError)
      return { error: "공부 시간 측정을 종료하는 중 오류가 발생했습니다." }
    }

    revalidatePath("/student/study-log")
    return { success: true, message: "공부 시간이 기록되었습니다." }
  } catch (error) {
    console.error("공부 시간 측정 종료 중 예외 발생:", error)
    return { error: "공부 시간 측정을 종료하는 중 오류가 발생했습니다." }
  }
}

// 자기평가 추가
export async function addSelfEvaluation(
  satisfactionLevel: number,
  achievementLevel: number,
  focusLevel: number,
  reflection: string | null,
  goalsForTomorrow: string | null,
): Promise<ActionResponse> {
  // 입력값 검증
  if (satisfactionLevel < 1 || satisfactionLevel > 5) {
    return { error: "만족도는 1에서 5 사이의 값이어야 합니다." }
  }

  if (achievementLevel < 1 || achievementLevel > 5) {
    return { error: "성취도는 1에서 5 사이의 값이어야 합니다." }
  }

  if (focusLevel < 1 || focusLevel > 5) {
    return { error: "집중도는 1에서 5 사이의 값이어야 합니다." }
  }

  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  try {
    // 오늘 날짜
    const today = new Date().toISOString().split("T")[0]

    // 이미 오늘 자기평가가 있는지 확인
    const { data: existingEvaluation, error: fetchError } = await supabase
      .from("self_evaluations")
      .select("id")
      .eq("student_id", session.user.id)
      .eq("evaluation_date", today)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("기존 자기평가 조회 오류:", fetchError)
      return { error: "기존 자기평가를 조회하는 중 오류가 발생했습니다." }
    }

    if (existingEvaluation) {
      // 기존 자기평가 업데이트
      const { error: updateError } = await supabase
        .from("self_evaluations")
        .update({
          satisfaction_level: satisfactionLevel,
          achievement_level: achievementLevel,
          focus_level: focusLevel,
          reflection: reflection,
          goals_for_tomorrow: goalsForTomorrow,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEvaluation.id)

      if (updateError) {
        console.error("자기평가 업데이트 오류:", updateError)
        return { error: "자기평가를 업데이트하는 중 오류가 발생했습니다." }
      }

      revalidatePath("/student/study-log")
      return { success: true, message: "자기평가가 업데이트되었습니다." }
    } else {
      // 새 자기평가 생성
      const { error: insertError } = await supabase.from("self_evaluations").insert({
        student_id: session.user.id,
        evaluation_date: today,
        satisfaction_level: satisfactionLevel,
        achievement_level: achievementLevel,
        focus_level: focusLevel,
        reflection: reflection,
        goals_for_tomorrow: goalsForTomorrow,
      })

      if (insertError) {
        console.error("자기평가 생성 오류:", insertError)
        return { error: "자기평가를 저장하는 중 오류가 발생했습니다." }
      }

      revalidatePath("/student/study-log")
      return { success: true, message: "자기평가가 저장되었습니다." }
    }
  } catch (error) {
    console.error("자기평가 저장 중 예외 발생:", error)
    return { error: "자기평가를 저장하는 중 오류가 발생했습니다." }
  }
}
