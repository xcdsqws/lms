"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getSubjects() {
  const supabase = createClient()

  const { data, error } = await supabase.from("subjects").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("과목 목록 조회 오류:", error.message)
    return { error: error.message }
  }

  return { subjects: data }
}

export async function getSubjectById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("subjects").select("*").eq("id", id).single()

  if (error) {
    console.error("과목 조회 오류:", error.message)
    return { error: error.message }
  }

  return { subject: data }
}

export async function createSubject(formData: FormData) {
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
    return { error: "관리자만 과목을 생성할 수 있습니다." }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    return { error: "과목명은 필수 입력 항목입니다." }
  }

  const { data, error } = await supabase
    .from("subjects")
    .insert([
      {
        title,
        description,
        created_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("과목 생성 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/subjects")
  return { success: "과목이 성공적으로 생성되었습니다.", subject: data[0] }
}

export async function updateSubject(id: string, formData: FormData) {
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
    return { error: "관리자만 과목을 수정할 수 있습니다." }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    return { error: "과목명은 필수 입력 항목입니다." }
  }

  const { error } = await supabase
    .from("subjects")
    .update({
      title,
      description,
    })
    .eq("id", id)

  if (error) {
    console.error("과목 수정 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/subjects")
  revalidatePath(`/admin/subjects/${id}`)
  return { success: "과목이 성공적으로 수정되었습니다." }
}

export async function deleteSubject(id: string) {
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
    return { error: "관리자만 과목을 삭제할 수 있습니다." }
  }

  // 관련 과제 확인
  const { data: assignments } = await supabase.from("assignments").select("id").eq("subject_id", id)

  if (assignments && assignments.length > 0) {
    return { error: "이 과목에 연결된 과제가 있어 삭제할 수 없습니다. 먼저 과제를 삭제해주세요." }
  }

  const { error } = await supabase.from("subjects").delete().eq("id", id)

  if (error) {
    console.error("과목 삭제 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/subjects")
  redirect("/admin/subjects")
}
