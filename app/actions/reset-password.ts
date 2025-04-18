"use server"

import { createClient } from "@/utils/supabase/server"

export async function resetPassword(email: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?next=/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.",
    }
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error)
    return {
      success: false,
      error: "비밀번호 재설정 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
    }
  }
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "비밀번호가 성공적으로 업데이트되었습니다.",
    }
  } catch (error) {
    console.error("비밀번호 업데이트 오류:", error)
    return {
      success: false,
      error: "비밀번호 업데이트 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
    }
  }
}
