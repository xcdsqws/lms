import { addStudyLog, startStudyTimeLog, endStudyTimeLog, addSelfEvaluation } from "@/actions/study-log-actions"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 모킹
jest.mock("@/lib/supabase/server")
jest.mock("next/cache")

describe("학습 기록 액션", () => {
  const mockSession = { user: { id: "user-123" } }

  beforeEach(() => {
    jest.clearAllMocks()

    // Supabase 클라이언트 모킹
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ data: { id: "log-123" }, error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })
  })

  describe("addStudyLog", () => {
    test("입력값이 유효하지 않을 경우 에러를 반환해야 함", async () => {
      const result = await addStudyLog("", "")
      expect(result).toEqual({ error: "과목과 내용을 모두 입력해주세요." })
    })

    test("세션이 없을 경우 에러를 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const result = await addStudyLog("subject-123", "공부 내용")
      expect(result).toEqual({ error: "인증되지 않은 사용자입니다." })
    })

    test("기존 기록이 없을 경우 새 기록을 생성해야 함", async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null })
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
            }),
          }),
          insert: mockInsert,
        }),
      })

      const result = await addStudyLog("subject-123", "공부 내용")

      expect(mockInsert).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/student/study-log")
      expect(result).toEqual({ success: true, message: "공부 기록이 저장되었습니다." })
    })

    test("기존 기록이 있을 경우 기록을 업데이트해야 함", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: "log-123" }, error: null }),
            }),
          }),
          update: mockUpdate,
        }),
      })

      const result = await addStudyLog("subject-123", "공부 내용")

      expect(mockUpdate).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/student/study-log")
      expect(result).toEqual({ success: true, message: "공부 기록이 업데이트되었습니다." })
    })
  })

  describe("startStudyTimeLog", () => {
    test("입력값이 유효하지 않을 경우 에러를 반환해야 함", async () => {
      const result = await startStudyTimeLog("")
      expect(result).toEqual({ error: "과목을 선택해주세요." })
    })

    test("세션이 없을 경우 에러를 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const result = await startStudyTimeLog("subject-123")
      expect(result).toEqual({ error: "인증되지 않은 사용자입니다." })
    })

    test("공부 시간 로그를 생성하고 로그 ID를 반환해야 함", async () => {
      const mockInsert = jest.fn().mockResolvedValue({
        data: { id: "time-log-123" },
        error: null,
      })
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          insert: mockInsert,
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "time-log-123" }, error: null }),
          }),
        }),
      })

      const result = await startStudyTimeLog("subject-123")

      expect(mockInsert).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/student/study-log")
      expect(result).toEqual({
        success: true,
        message: "공부 시간 측정이 시작되었습니다.",
        logId: "time-log-123",
      })
    })
  })

  describe("endStudyTimeLog", () => {
    test("로그 ID와 지속 시간이 유효해야 함", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              single: jest.fn().mockResolvedValue({ data: { student_id: "user-123" }, error: null }),
            }),
          }),
          update: mockUpdate,
        }),
      })

      const result = await endStudyTimeLog("time-log-123", 30)

      expect(mockUpdate).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/student/study-log")
      expect(result).toEqual({ success: true })
    })

    test("로그 소유자가 아닐 경우 에러를 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              single: jest.fn().mockResolvedValue({ data: { student_id: "other-user" }, error: null }),
            }),
          }),
        }),
      })

      const result = await endStudyTimeLog("time-log-123", 30)
      expect(result).toEqual({ error: "권한이 없습니다." })
    })
  })

  describe("addSelfEvaluation", () => {
    test("자기평가를 저장해야 함", async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null })
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
            }),
          }),
          insert: mockInsert,
        }),
      })

      const result = await addSelfEvaluation(4, 3, 5, "오늘 공부 잘했다", "내일은 더 열심히")

      expect(mockInsert).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/student/study-log")
      expect(result).toEqual({ success: true, message: "자기평가가 저장되었습니다." })
    })

    test("기존 자기평가가 있을 경우 업데이트해야 함", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: "eval-123" }, error: null }),
            }),
          }),
          update: mockUpdate,
        }),
      })

      const result = await addSelfEvaluation(4, 3, 5, "오늘 공부 잘했다", "내일은 더 열심히")

      expect(mockUpdate).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith("/student/study-log")
      expect(result).toEqual({ success: true, message: "자기평가가 업데이트되었습니다." })
    })
  })
})
