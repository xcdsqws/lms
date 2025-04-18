"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAssignments() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("assignments")
    .select(`
      *,
      subjects (
        id,
        title
      ),
      profiles (
        id,
        full_name
      )
    `)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("과제 목록 조회 오류:", error.message)
    return { error: error.message }
  }

  return { assignments: data }
}

export async function getAssignmentById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("assignments")
    .select(`
      *,
      subjects (
        id,
        title
      ),
      profiles (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("과제 조회 오류:", error.message)
    return { error: error.message }
  }

  return { assignment: data }
}

export async function createAssignment(formData: FormData) {
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
    return { error: "관리자만 과제를 생성할 수 있습니다." }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const subjectId = formData.get("subject_id") as string
  const dueDate = formData.get("due_date") as string

  if (!title) {
    return { error: "과제명은 필수 입력 항목입니다." }
  }

  if (!subjectId) {
    return { error: "과목을 선택해주세요." }
  }

  if (!dueDate) {
    return { error: "마감일을 설정해주세요." }
  }

  const { data, error } = await supabase
    .from("assignments")
    .insert([
      {
        title,
        description,
        subject_id: subjectId,
        due_date: dueDate,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("과제 생성 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/assignments")
  return { success: "과제가 성공적으로 생성되었습니다.", assignment: data[0] }
}

export async function updateAssignment(id: string, formData: FormData) {
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
    return { error: "관리자만 과제를 수정할 수 있습니다." }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const subjectId = formData.get("subject_id") as string
  const dueDate = formData.get("due_date") as string

  if (!title) {
    return { error: "과제명은 필수 입력 항목입니다." }
  }

  if (!subjectId) {
    return { error: "과목을 선택해주세요." }
  }

  if (!dueDate) {
    return { error: "마감일을 설정해주세요." }
  }

  const { error } = await supabase
    .from("assignments")
    .update({
      title,
      description,
      subject_id: subjectId,
      due_date: dueDate,
    })
    .eq("id", id)

  if (error) {
    console.error("과제 수정 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/assignments")
  revalidatePath(`/admin/assignments/${id}`)
  return { success: "과제가 성공적으로 수정되었습니다." }
}

export async function deleteAssignment(id: string) {
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
    return { error: "관리자만 과제를 삭제할 수 있습니다." }
  }

  // 관련 진도 기록 삭제
  const { error: progressError } = await supabase.from("progress").delete().eq("assignment_id", id)

  if (progressError) {
    console.error("진도 기록 삭제 오류:", progressError.message)
    return { error: "진도 기록 삭제 중 오류가 발생했습니다." }
  }

  const { error } = await supabase.from("assignments").delete().eq("id", id)

  if (error) {
    console.error("과제 삭제 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/assignments")
  redirect("/admin/assignments")
}
