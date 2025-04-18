import { NextResponse, type NextRequest } from "next/server"

// 미들웨어를 비활성화하고 각 페이지에서 인증을 확인하도록 변경
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// 빈 matcher로 설정하여 미들웨어가 실행되지 않도록 함
export const config = {
  matcher: [],
}
