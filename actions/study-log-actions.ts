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

// 나머지 함수들도 동일한 패턴으로 업데이트...
