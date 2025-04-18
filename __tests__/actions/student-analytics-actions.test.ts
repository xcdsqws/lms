import { getStudentLearningStats, generateStudentLearningReport } from "@/actions/student-analytics-actions"
import { createClient } from "@/lib/supabase/server"

// 모킹
jest.mock("@/lib/supabase/server")

describe("학습 분석 액션", () => {
  const mockSession = { user: { id: "user-123" } }
  const mockStudent = { id: "user-123", full_name: "홍길동" }
  const mockSubjects = [
    { id: "subject-1", name: "수학" },
    { id: "subject-2", name: "영어" },
  ]
  const mockStudyTimeLogs = [
    {
      id: "log-1",
      student_id: "user-123",
      subject_id: "subject-1",
      duration_minutes: 60,
      study_date: "2023-01-01",
      subjects: { name: "수학" },
    },
    {
      id: "log-2",
      student_id: "user-123",
      subject_id: "subject-2",
      duration_minutes: 30,
      study_date: "2023-01-01",
      subjects: { name: "영어" },
    },
  ]
  const mockSelfEvaluations = [
    {
      id: "eval-1",
      student_id: "user-123",
      evaluation_date: "2023-01-01",
      satisfaction_level: 4,
      achievement_level: 3,
      focus_level: 5,
    },
  ]
  const mockStudyLogs = [
    {
      id: "study-log-1",
      student_id: "user-123",
      subject_id: "subject-1",
      content: "수학 공부",
      study_date: "2023-01-01",
      subjects: { name: "수학" },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Supabase 클라이언트 모킹
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      },
      from: jest.fn().mockImplementation((table) => {
        if (table === "profiles") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockStudent, error: null }),
              }),
            }),
          }
        } else if (table === "subjects") {
          return {
            select: jest.fn().mockResolvedValue({ data: mockSubjects, error: null }),
          }
        } else if (table === "study_time_logs") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({ data: mockStudyTimeLogs, error: null }),
                  }),
                }),
              }),
            }),
          }
        } else if (table === "self_evaluations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({ data: mockSelfEvaluations, error: null }),
                  }),
                }),
              }),
            }),
          }
        } else if (table === "study_logs") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                      range: jest.fn().mockResolvedValue({
                        data: mockStudyLogs,
                        error: null,
                        count: mockStudyLogs.length,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }
      }),
    })
  })

  describe("getStudentLearningStats", () => {
    test("세션이 없을 경우 에러를 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const result = await getStudentLearningStats()
      expect(result).toEqual({ error: "인증되지 않은 사용자입니다." })
    })

    test("학습 통계를 올바르게 반환해야 함", async () => {
      const result = await getStudentLearningStats("month")

      expect(result).toHaveProperty("student", mockStudent)
      expect(result).toHaveProperty("subjects", mockSubjects)
      expect(result).toHaveProperty("studyTimeLogs", mockStudyTimeLogs)
      expect(result).toHaveProperty("selfEvaluations", mockSelfEvaluations)
      expect(result).toHaveProperty("studyLogs", mockStudyLogs)
      expect(result).toHaveProperty("summary")
      expect(result).toHaveProperty("period", "month")
      expect(result).toHaveProperty("pagination")
      expect(result.pagination).toHaveProperty("totalItems", 1)
    })

    test("페이지네이션 파라미터를 올바르게 처리해야 함", async () => {
      const result = await getStudentLearningStats("month", { page: 2, pageSize: 5 })

      expect(result).toHaveProperty("pagination")
      expect(result.pagination).toHaveProperty("page", 2)
      expect(result.pagination).toHaveProperty("pageSize", 5)
    })

    test("과목별 총 공부 시간을 올바르게 계산해야 함", async () => {
      const result = await getStudentLearningStats()

      expect(result).toHaveProperty("subjectTotalTime")
      expect(result.subjectTotalTime).toHaveProperty("수학", 60)
      expect(result.subjectTotalTime).toHaveProperty("영어", 30)
    })

    test("일별 총 공부 시간을 올바르게 계산해야 함", async () => {
      const result = await getStudentLearningStats()

      expect(result).toHaveProperty("dailyStudyTime")
      expect(result.dailyStudyTime).toHaveProperty("2023-01-01", 90) // 수학 60분 + 영어 30분
    })

    test("자기평가 평균을 올바르게 계산해야 함", async () => {
      const result = await getStudentLearningStats()

      expect(result).toHaveProperty("evaluationAverages")
      expect(result.evaluationAverages).toHaveProperty("satisfaction", 4)
      expect(result.evaluationAverages).toHaveProperty("achievement", 3)
      expect(result.evaluationAverages).toHaveProperty("focus", 5)
    })
  })

  describe("generateStudentLearningReport", () => {
    test("학습 리포트를 올바르게 생성해야 함", async () => {
      const result = await generateStudentLearningReport("month")

      expect(result).toHaveProperty("student", mockStudent)
      expect(result).toHaveProperty("subjects", mockSubjects)
      expect(result).toHaveProperty("studyTimeLogs", mockStudyTimeLogs)
      expect(result).toHaveProperty("selfEvaluations", mockSelfEvaluations)
      expect(result).toHaveProperty("studyLogs", mockStudyLogs)
      expect(result).toHaveProperty("generatedAt")
      expect(result).toHaveProperty("reportType", "학습 통계 리포트")
    })

    test("getStudentLearningStats에서 에러가 발생할 경우 에러를 반환해야 함", async () => {
      ;(createClient as jest.Mock).mockReturnValue({
        auth: {
          getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        },
      })

      const result = await generateStudentLearningReport()
      expect(result).toEqual({ error: "인증되지 않은 사용자입니다." })
    })
  })
})
