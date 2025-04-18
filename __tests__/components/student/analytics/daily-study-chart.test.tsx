import type React from "react"
import { render, screen } from "@testing-library/react"
import { DailyStudyChart } from "@/components/student/analytics/daily-study-chart"

// 모킹
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Line: () => <div data-testid="line" />,
}))

describe("DailyStudyChart 컴포넌트", () => {
  test("데이터가 있을 때 차트가 올바르게 렌더링되어야 함", () => {
    const dailyChartData = [
      { date: "2023-01-01", formattedDate: "1/1", minutes: 60, hours: 1 },
      { date: "2023-01-02", formattedDate: "1/2", minutes: 120, hours: 2 },
      { date: "2023-01-03", formattedDate: "1/3", minutes: 90, hours: 1.5 },
    ]

    render(<DailyStudyChart dailyChartData={dailyChartData} />)

    expect(screen.getByText("일별 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("날짜별 공부 시간 추이")).toBeInTheDocument()
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument()
    expect(screen.getByTestId("line-chart")).toBeInTheDocument()
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument()
    expect(screen.getByTestId("x-axis")).toBeInTheDocument()
    expect(screen.getByTestId("y-axis")).toBeInTheDocument()
    expect(screen.getByTestId("tooltip")).toBeInTheDocument()
    expect(screen.getByTestId("line")).toBeInTheDocument()
  })

  test("데이터가 없을 때 안내 메시지가 표시되어야 함", () => {
    const emptyData = [
      { date: "2023-01-01", formattedDate: "1/1", minutes: 0, hours: 0 },
      { date: "2023-01-02", formattedDate: "1/2", minutes: 0, hours: 0 },
    ]

    render(<DailyStudyChart dailyChartData={emptyData} />)

    expect(screen.getByText("일별 공부 시간")).toBeInTheDocument()
    expect(screen.getByText("날짜별 공부 시간 추이")).toBeInTheDocument()
    expect(screen.getByText("공부 시간 데이터가 없습니다. 공부 시간을 기록하면 여기에 표시됩니다.")).toBeInTheDocument()
  })
})
