import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SelfEvaluationForm } from "@/components/student/self-evaluation-form"
import { addSelfEvaluation } from "@/actions/study-log-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// 모킹
jest.mock("@/actions/study-log-actions")
jest.mock("@/hooks/use-toast")
jest.mock("next/navigation")

describe("SelfEvaluationForm 컴포넌트", () => {
  const mockUserId = "user-123"
  const mockToast = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // 액션 모킹
    ;(addSelfEvaluation as jest.Mock).mockResolvedValue({
      success: true,
      message: "자기평가가 저장되었습니다.",
    })

    // useToast 모킹
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

    // useRouter 모킹
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    })
  })

  test("컴포넌트가 올바르게 렌더링되어야 함", () => {
    render(<SelfEvaluationForm userId={mockUserId} />)

    expect(screen.getByText("오늘의 자기평가")).toBeInTheDocument()
    expect(screen.getByText("만족도")).toBeInTheDocument()
    expect(screen.getByText("성취도")).toBeInTheDocument()
    expect(screen.getByText("집중도")).toBeInTheDocument()
    expect(screen.getByLabelText("오늘의 학습 성찰")).toBeInTheDocument()
    expect(screen.getByLabelText("내일의 학습 목표")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "저장하기" })).toBeInTheDocument()
  })

  test("기존 평가가 있을 경우 해당 값으로 초기화되어야 함", () => {
    const existingEvaluation = {
      id: "eval-123",
      satisfaction_level: 4,
      achievement_level: 3,
      focus_level: 5,
      reflection: "오늘 공부 잘했다",
      goals_for_tomorrow: "내일은 더 열심히",
    }

    render(<SelfEvaluationForm userId={mockUserId} existingEvaluation={existingEvaluation} />)

    // 텍스트 영역 값 확인
    expect(screen.getByLabelText("오늘의 학습 성찰")).toHaveValue("오늘 공부 잘했다")
    expect(screen.getByLabelText("내일의 학습 목표")).toHaveValue("내일은 더 열심히")

    // 버튼 텍스트 확인
    expect(screen.getByRole("button", { name: "업데이트하기" })).toBeInTheDocument()
  })

  test("폼 제출 시 자기평가가 저장되어야 함", async () => {
    render(<SelfEvaluationForm userId={mockUserId} />)

    // 만족도 선택 (4점)
    fireEvent.click(screen.getByLabelText("만족도-4"))

    // 성취도 선택 (3점)
    fireEvent.click(screen.getByLabelText("성취도-3"))

    // 집중도 선택 (5점)
    fireEvent.click(screen.getByLabelText("집중도-5"))

    // 학습 성찰 입력
    fireEvent.change(screen.getByLabelText("오늘의 학습 성찰"), {
      target: { value: "오늘 공부 잘했다" },
    })

    // 학습 목표 입력
    fireEvent.change(screen.getByLabelText("내일의 학습 목표"), {
      target: { value: "내일은 더 열심히" },
    })

    // 폼 제출
    fireEvent.click(screen.getByRole("button", { name: "저장하기" }))

    await waitFor(() => {
      expect(addSelfEvaluation).toHaveBeenCalledWith(
        4, // 만족도
        3, // 성취도
        5, // 집중도
        "오늘 공부 잘했다", // 학습 성찰
        "내일은 더 열심히", // 학습 목표
      )
      expect(mockToast).toHaveBeenCalledWith({
        title: "성공",
        description: "자기평가가 저장되었습니다.",
      })
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  test("저장 중에는 버튼이 비활성화되어야 함", async () => {
    // 저장 액션이 완료되기 전까지 대기하도록 설정
    let resolveAction: (value: any) => void
    ;(addSelfEvaluation as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve
        }),
    )

    render(<SelfEvaluationForm userId={mockUserId} />)

    // 폼 제출
    fireEvent.click(screen.getByRole("button", { name: "저장하기" }))

    // 버튼이 비활성화되고 로딩 상태가 표시되는지 확인
    expect(screen.getByRole("button", { name: "저장 중..." })).toBeDisabled()

    // 액션 완료
    resolveAction!({ success: true, message: "자기평가가 저장되었습니다." })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "저장하기" })).toBeEnabled()
    })
  })

  test("에러 발생 시 에러 메시지가 표시되어야 함", async () => {
    ;(addSelfEvaluation as jest.Mock).mockResolvedValue({
      error: "자기평가를 저장하는 중 오류가 발생했습니다.",
    })

    render(<SelfEvaluationForm userId={mockUserId} />)

    // 폼 제출
    fireEvent.click(screen.getByRole("button", { name: "저장하기" }))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "오류 발생",
        description: "자기평가를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    })
  })
})
