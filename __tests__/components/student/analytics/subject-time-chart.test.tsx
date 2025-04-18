import type React from "react"
import { render, screen } from "@testing-library/react"
import { SubjectTimeChart } from "@/components/student/analytics/subject-time-chart"

// 모킹
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Bar: () => <div data-testid="bar" />,
}))

describe("SubjectTimeChart 컴포넌트", () => {
  test("데이터가 있을 때 차트가 올바르게 렌더링되어야 함", () => {
    const subjectTotalTime = {
      수학: 120,
      영어: 60,
      과학: 90,
    }

    render(<SubjectTimeChart subjectTotalTime={subjectTotalTime} />)

    expect(screen.getByText("과목별 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("과목별 누적 공부 시간")).toBeInTheDocument()
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument()
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument()
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument()
    expect(screen.getByTestId("x-axis")).toBeInTheDocument()
    expect(screen.getByTestId("y-axis")).toBeInTheDocument()
    expect(screen.getByTestId("tooltip")).toBeInTheDocument()
    expect(screen.getByTestId("bar")).toBeInTheDocument()
  })

  test("데이터가 없을 때 안내 메시지가 표시되어야 함", () => {
    render(<SubjectTimeChart subjectTotalTime={{}} />)

    expect(screen.getByText("과목별 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("과목별 누적 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("공부 시간 데이터가 없습니다. 공부 시간을 기록하면 여기에 표시됩니다.")).toBeInTheDocument()
  })
})
