"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAnnouncements() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      profiles (
        id,
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("공지사항 목록 조회 오류:", error.message)
    return { error: error.message }
  }

  return { announcements: data }
}

export async function getAnnouncementById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      profiles (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("공지사항 조회 오류:", error.message)
    return { error: error.message }
  }

  return { announcement: data }
}

export async function createAnnouncement(formData: FormData) {
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
    return { error: "관리자만 공지사항을 작성할 수 있습니다." }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title) {
    return { error: "제목은 필수 입력 항목입니다." }
  }

  if (!content) {
    return { error: "내용은 필수 입력 항목입니다." }
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert([
      {
        title,
        content,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
      },
    ])
    .select()

  if (error) {
    console.error("공지사항 생성 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/announcements")
  revalidatePath("/announcements")
  return { success: "공지사항이 성공적으로 작성되었습니다.", announcement: data[0] }
}

export async function updateAnnouncement(id: string, formData: FormData) {
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
    return { error: "관리자만 공지사항을 수정할 수 있습니다." }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title) {
    return { error: "제목은 필수 입력 항목입니다." }
  }

  if (!content) {
    return { error: "내용은 필수 입력 항목입니다." }
  }

  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      content,
    })
    .eq("id", id)

  if (error) {
    console.error("공지사항 수정 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/announcements")
  revalidatePath("/announcements")
  revalidatePath(`/announcements/${id}`)
  return { success: "공지사항이 성공적으로 수정되었습니다." }
}

export async function deleteAnnouncement(id: string) {
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
    return { error: "관리자만 공지사항을 삭제할 수 있습니다." }
  }

  const { error } = await supabase.from("announcements").delete().eq("id", id)

  if (error) {
    console.error("공지사항 삭제 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/admin/announcements")
  revalidatePath("/announcements")
  redirect("/admin/announcements")
}
