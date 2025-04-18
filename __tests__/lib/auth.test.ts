import { getSession, getUserRole, requireAuth, requireAdmin, requireStudent } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// 모킹
jest.mock("@/lib/supabase/server")
jest.mock("next/navigation")

describe("인증 유틸리티 함수", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getSession", () => {
    test("세션이 있을 경우 세션을 반환해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
      })

      const session = await getSession()
      expect(session).toEqual(mockSession)
    })

    test("세션이 없을 경우 null을 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const session = await getSession()
      expect(session).toBeNull()
    })
  })

  describe("getUserRole", () => {
    test("세션이 있고 프로필이 있을 경우 역할을 반환해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: "student" } }),
            }),
          }),
        }),
      })

      const role = await getUserRole()
      expect(role).toBe("student")
    })

    test("세션이 없을 경우 null을 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const role = await getUserRole()
      expect(role).toBeNull()
    })
  })

  describe("requireAuth", () => {
    test("세션이 있을 경우 세션을 반환해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
      })

      const session = await requireAuth()
      expect(session).toEqual(mockSession)
      expect(redirect).not.toHaveBeenCalled()
    })

    test("세션이 없을 경우 홈페이지로 리디렉션해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      await requireAuth()
      expect(redirect).toHaveBeenCalledWith("/")
    })
  })

  describe("requireAdmin", () => {
    test("세션이 있고 역할이 admin일 경우 세션을 반환해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: "admin" } }),
            }),
          }),
        }),
      })

      const session = await requireAdmin()
      expect(session).toEqual(mockSession)
      expect(redirect).not.toHaveBeenCalled()
    })

    test("세션이 있지만 역할이 admin이 아닐 경우 학생 대시보드로 리디렉션해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: "student" } }),
            }),
          }),
        }),
      })

      await requireAdmin()
      expect(redirect).toHaveBeenCalledWith("/student/dashboard")
    })
  })

  describe("requireStudent", () => {
    test("세션이 있고 역할이 student일 경우 세션을 반환해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: "student" } }),
            }),
          }),
        }),
      })

      const session = await requireStudent()
      expect(session).toEqual(mockSession)
      expect(redirect).not.toHaveBeenCalled()
    })

    test("세션이 있지만 역할이 student가 아닐 경우 관리자 대시보드로 리디렉션해야 함", async () => {
      const mockSession = { user: { id: "user-123" } }
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: "admin" } }),
            }),
          }),
        }),
      })

      await requireStudent()
      expect(redirect).toHaveBeenCalledWith("/admin/dashboard")
    })
  })
})
