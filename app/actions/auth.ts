"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(formData: FormData) {
  const supabase = createClient()

  // 이메일과 비밀번호 가져오기
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("로그인 오류:", error.message)
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const supabase = createClient()

  try {
    // 폼 데이터 가져오기
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const role = "student" // 기본 역할은 학생

    console.log("회원가입 시도:", { email, fullName })

    // 비밀번호 길이 확인
    if (password.length < 6) {
      return { error: "비밀번호는 최소 6자 이상이어야 합니다." }
    }

    // 회원가입
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      console.error("회원가입 오류:", error.message)

      // 오류 메시지 한글화
      if (error.message.includes("already registered")) {
        return { error: "이미 등록된 이메일 주소입니다." }
      }

      if (error.message.includes("invalid email")) {
        return { error: "유효하지 않은 이메일 형식입니다." }
      }

      return { error: `회원가입 오류: ${error.message}` }
    }

    // 프로필 생성
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        role: "student",
      })

      if (profileError) {
        console.error("프로필 생성 오류:", profileError.message)
        return { error: `프로필 생성 오류: ${profileError.message}` }
      }
    }

    return { success: "회원가입이 완료되었습니다. 이메일을 확인해주세요." }
  } catch (error) {
    console.error("예상치 못한 오류:", error)
    return { error: "회원가입 중 예상치 못한 오류가 발생했습니다." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "비밀번호 재설정 링크가 이메일로 전송되었습니다." }
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "비밀번호가 성공적으로 업데이트되었습니다." }
}
