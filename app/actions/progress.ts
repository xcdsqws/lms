"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getStudentProgress(studentId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("progress")
    .select(`
      *,
      assignments (
        id,
        title,
        due_date,
        subjects (
          id,
          title
        )
      )
    `)
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("학생 진도 조회 오류:", error.message)
    return { error: error.message }
  }

  return { progress: data }
}

export async function getAssignmentProgress(assignmentId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("progress")
    .select(`
      *,
      profiles (
        id,
        full_name,
        grade,
        class_number,
        student_number
      )
    `)
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: false })

  if (error) {
    console.error("과제 진도 조회 오류:", error.message)
    return { error: error.message }
  }

  return { progress: data }
}

export async function submitAssignment(formData: FormData) {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  const assignmentId = formData.get("assignment_id") as string

  if (!assignmentId) {
    return { error: "과제 ID가 필요합니다." }
  }

  // 과제 정보 조회
  const { data: assignment } = await supabase.from("assignments").select("subject_id").eq("id", assignmentId).single()

  if (!assignment) {
    return { error: "과제를 찾을 수 없습니다." }
  }

  // 이미 제출한 과제인지 확인
  const { data: existingProgress } = await supabase
    .from("progress")
    .select("id")
    .eq("student_id", session.user.id)
    .eq("assignment_id", assignmentId)
    .single()

  if (existingProgress) {
    // 이미 제출한 과제라면 업데이트
    const { error } = await supabase
      .from("progress")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingProgress.id)

    if (error) {
      console.error("과제 재제출 오류:", error.message)
      return { error: error.message }
    }

    revalidatePath("/assignments")
    return { success: "과제가 성공적으로 재제출되었습니다." }
  }

  // 새로운 과제 제출
  const { error } = await supabase.from("progress").insert([
    {
      student_id: session.user.id,
      assignment_id: assignmentId,
      subject_id: assignment.subject_id,
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  if (error) {
    console.error("과제 제출 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/assignments")
  return { success: "과제가 성공적으로 제출되었습니다." }
}

export async function gradeAssignment(progressId: string, formData: FormData) {
  const supabase = createClient()

  // 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "인증되지 않은 사용자입니다." }
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (!profile || profile.role !== "admin") {
    return { error: "관리자만 과제를 평가할 수 있습니다." }
  }

  const score = Number.parseInt(formData.get("score") as string)
  const feedback = formData.get("feedback") as string

  if (isNaN(score) || score < 0 || score > 100) {
    return { error: "점수는 0에서 100 사이의 숫자여야 합니다." }
  }

  const { error } = await supabase
    .from("progress")
    .update({
      score,
      feedback,
      status: "graded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", progressId)

  if (error) {
    console.error("과제 평가 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/assignments")
  return { success: "과제가 성공적으로 평가되었습니다." }
}
