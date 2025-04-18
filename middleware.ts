import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // 사용자 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 로그인 페이지 접근 시 이미 로그인한 사용자는 대시보드로 리다이렉트
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return response
  }

  // 보호된 경로 접근 시 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/profile")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // 관리자 전용 페이지 접근 제한
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // 사용자 역할 확인
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
