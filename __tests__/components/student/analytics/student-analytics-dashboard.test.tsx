import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { StudentAnalyticsDashboard } from "@/components/student/analytics/student-analytics-dashboard"
import { getStudentLearningStats, generateStudentLearningReport } from "@/actions/student-analytics-actions"

// 모킹
jest.mock("@/actions/student-analytics-actions")

describe("StudentAnalyticsDashboard 컴포넌트", () => {
  const mockAnalyticsData = {
    student: { id: "user-123", full_name: "홍길동" },
    subjects: [
      { id: "subject-1", name: "수학" },
      { id: "subject-2", name: "영어" },
    ],
    subjectTotalTime: { 수학: 120, 영어: 60 },
    dailyChartData: [
      { date: "2023-01-01", formattedDate: "1/1", minutes: 60, hours: 1 },
      { date: "2023-01-02", formattedDate: "1/2", minutes: 120, hours: 2 },
    ],
    evaluationTrends: [{ date: "2023-01-01", formattedDate: "1/1", satisfaction: 4, achievement: 3, focus: 5 }],
    studyTimeLogs: [{ id: "log-1", study_date: "2023-01-01", duration_minutes: 60, subjects: { name: "수학" } }],
    studyLogs: [{ id: "log-1", study_date: "2023-01-01", content: "수학 공부", subjects: { name: "수학" } }],
    pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
    summary: {
      totalStudyTime: { hours: 3, minutes: 0, totalMinutes: 180 },
      averageStudyTime: { hours: 1, minutes: 30, totalMinutes: 90 },
      daysStudied: 2,
      totalDays: 7,
      studyRate: 29,
      mostStudiedSubject: { name: "수학", minutes: 120, hours: 2, remainingMinutes: 0 },
      mostStudiedDay: { date: "2023-01-02", formattedDate: "1/2", minutes: 120, hours: 2, remainingMinutes: 0 },
    },
    period: "month",
    dateRange: { start: "2023-01-01", end: "2023-01-31" },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // 액션 모킹
    ;(getStudentLearningStats as jest.Mock).mockResolvedValue(mockAnalyticsData)
    ;(generateStudentLearningReport as jest.Mock).mockResolvedValue({
      ...mockAnalyticsData,
      generatedAt: "2023-01-31T12:00:00Z",
      reportType: "학습 통계 리포트",
    })
  })

  test("컴포넌트가 올바르게 렌더링되어야 함", async () => {
    render(<StudentAnalyticsDashboard />)

    // 로딩 상태 확인
    expect(screen.getByRole("status")).toBeInTheDocument()

    await waitFor(() => {
      expect(getStudentLearningStats).toHaveBeenCalledWith("month", { page: 1, pageSize: 10 })
    })

    // 기간 선택 탭 확인
    expect(screen.getByRole("tab", { name: /최근 1주일/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /최근 1개월/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /최근 3개월/i })).toBeInTheDocument()

    // 리포트 다운로드 버튼 확인
    expect(screen.getByRole("button", { name: /리포트 다운로드/i })).toBeInTheDocument()

    // 요약 정보 확인
    expect(screen.getByText("3시간 0분")).toBeInTheDocument() // 총 공부 시간
    expect(screen.getByText("1시간 30분")).toBeInTheDocument() // 일평균 공부 시간
    expect(screen.getByText("2일 / 7일 (29%)")).toBeInTheDocument() // 공부한 날
    expect(screen.getByText("수학")).toBeInTheDocument() // 가장 많이 공부한 과목

    // 차트 확인
    expect(screen.getByText("과목별 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("일별 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("자기평가 추이")).toBeInTheDocument()

    // 탭 확인
    expect(screen.getByRole("tab", { name: /공부 기록/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /공부 시간 기록/i })).toBeInTheDocument()
  })

  test("기간 변경 시 데이터를 다시 불러와야 함", async () => {
    render(<StudentAnalyticsDashboard />)

    await waitFor(() => {
      expect(getStudentLearningStats).toHaveBeenCalledWith("month", { page: 1, pageSize: 10 })
    })

    // 기간 변경
    fireEvent.click(screen.getByRole("tab", { name: /최근 1주일/i }))

    await waitFor(() => {
      expect(getStudentLearningStats).toHaveBeenCalledWith("week", { page: 1, pageSize: 10 })
    })

    // 다시 기간 변경
    fireEvent.click(screen.getByRole("tab", { name: /최근 3개월/i }))

    await waitFor(() => {
      expect(getStudentLearningStats).toHaveBeenCalledWith("3months", { page: 1, pageSize: 10 })
    })
  })

  test("리포트 다운로드 버튼 클릭 시 리포트를 생성해야 함", async () => {
    // URL.createObjectURL 및 관련 DOM API 모킹
    global.URL.createObjectURL = jest.fn(() => "blob:test")
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    const mockClick = jest.fn()

    document.body.appendChild = mockAppendChild
    document.body.removeChild = mockRemoveChild

    HTMLAnchorElement.prototype.click = mockClick

    render(<StudentAnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })

    // 리포트 다운로드 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /리포트 다운로드/i }))

    await waitFor(() => {
      expect(generateStudentLearningReport).toHaveBeenCalledWith("month")
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })
  })

  test("에러 발생 시 에러 메시지가 표시되어야 함", async () => {
    ;(getStudentLearningStats as jest.Mock).mockResolvedValue({ error: "학습 통계를 불러오는 중 오류가 발생했습니다." })

    render(<StudentAnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByText("학습 통계를 불러오는 중 오류가 발생했습니다.")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /다시 시도/i })).toBeInTheDocument()
    })

    // 다시 시도 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /다시 시도/i }))

    await waitFor(() => {
      expect(getStudentLearningStats).toHaveBeenCalledTimes(2)
    })
  })

  test("데이터가 없을 경우 안내 메시지가 표시되어야 함", async () => {
    ;(getStudentLearningStats as jest.Mock).mockResolvedValue({})

    render(<StudentAnalyticsDashboard />)

    await waitFor(() => {
      expect(screen.getByText("학습 데이터가 없습니다. 공부 기록을 시작해보세요!")).toBeInTheDocument()
    })
  })
})
