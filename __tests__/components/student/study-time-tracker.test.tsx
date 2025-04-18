import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { StudyTimeTracker } from "@/components/student/study-time-tracker"
import { startStudyTimeLog, endStudyTimeLog } from "@/actions/study-log-actions"
import { useToast } from "@/hooks/use-toast"

// 모킹
jest.mock("@/actions/study-log-actions")
jest.mock("@/hooks/use-toast")

describe("StudyTimeTracker 컴포넌트", () => {
  const mockSubjects = [
    { id: "subject-1", name: "수학" },
    { id: "subject-2", name: "영어" },
  ]
  const mockUserId = "user-123"
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // 액션 모킹
    ;(startStudyTimeLog as jest.Mock).mockResolvedValue({
      success: true,
      logId: "time-log-123",
    })
    ;(endStudyTimeLog as jest.Mock).mockResolvedValue({ success: true })

    // useToast 모킹
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test("컴포넌트가 올바르게 렌더링되어야 함", () => {
    render(<StudyTimeTracker subjects={mockSubjects} userId={mockUserId} />)

    expect(screen.getByText("공부 시간 측정")).toBeInTheDocument()
    expect(screen.getByText("과목 선택")).toBeInTheDocument()
    expect(screen.getByText("00:00:00")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /시작/i })).toBeInTheDocument()
  })

  test("과목을 선택하고 시작 버튼을 클릭하면 타이머가 시작되어야 함", async () => {
    render(<StudyTimeTracker subjects={mockSubjects} userId={mockUserId} />)

    // 과목 선택
    fireEvent.click(screen.getByText("과목 선택"))
    fireEvent.click(screen.getByText("수학"))

    // 시작 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /시작/i }))

    await waitFor(() => {
      expect(startStudyTimeLog).toHaveBeenCalledWith("subject-1")
    })

    // 타이머 진행
    jest.advanceTimersByTime(3000) // 3초 진행

    expect(screen.getByText("00:00:03")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /일시정지/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /종료/i })).toBeInTheDocument()
  })

  test("일시정지 버튼을 클릭하면 타이머가 일시정지되어야 함", async () => {
    render(<StudyTimeTracker subjects={mockSubjects} userId={mockUserId} />)

    // 과목 선택 및 시작
    fireEvent.click(screen.getByText("과목 선택"))
    fireEvent.click(screen.getByText("수학"))
    fireEvent.click(screen.getByRole("button", { name: /시작/i }))

    await waitFor(() => {
      expect(startStudyTimeLog).toHaveBeenCalled()
    })

    // 타이머 진행
    jest.advanceTimersByTime(5000) // 5초 진행

    // 일시정지 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /일시정지/i }))

    const timeBeforePause = screen.getByText("00:00:05").textContent

    // 추가 시간 진행 (일시정지 상태이므로 타이머가 증가하지 않아야 함)
    jest.advanceTimersByTime(3000)

    expect(screen.getByText("00:00:05")).toBeInTheDocument() // 시간이 변하지 않아야 함
    expect(screen.getByRole("button", { name: /계속하기/i })).toBeInTheDocument()
  })

  test("종료 버튼을 클릭하면 타이머가 종료되고 기록이 저장되어야 함", async () => {
    render(<StudyTimeTracker subjects={mockSubjects} userId={mockUserId} />)

    // 과목 선택 및 시작
    fireEvent.click(screen.getByText("과목 선택"))
    fireEvent.click(screen.getByText("수학"))
    fireEvent.click(screen.getByRole("button", { name: /시작/i }))

    await waitFor(() => {
      expect(startStudyTimeLog).toHaveBeenCalled()
    })

    // 타이머 진행
    jest.advanceTimersByTime(60000) // 1분 진행

    // 종료 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /종료/i }))

    await waitFor(() => {
      expect(endStudyTimeLog).toHaveBeenCalledWith("time-log-123", 1)
    })

    // 타이머가 리셋되어야 함
    expect(screen.getByText("00:00:00")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /시작/i })).toBeInTheDocument()
  })

  test("과목을 선택하지 않고 시작 버튼을 클릭하면 에러 메시지가 표시되어야 함", async () => {
    render(<StudyTimeTracker subjects={mockSubjects} userId={mockUserId} />)

    // 과목 선택 없이 시작 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: /시작/i }))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "과목을 선택하세요",
        description: "공부 시간을 기록할 과목을 선택해주세요.",
        variant: "destructive",
      })
    })

    // 타이머가 시작되지 않아야 함
    expect(startStudyTimeLog).not.toHaveBeenCalled()
    expect(screen.getByText("00:00:00")).toBeInTheDocument()
  })
})
