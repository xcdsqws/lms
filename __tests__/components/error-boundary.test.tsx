"use client"

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { ErrorBoundary } from "@/components/error-boundary"

describe("ErrorBoundary 컴포넌트", () => {
  const originalConsoleError = console.error

  beforeEach(() => {
    // console.error 모킹 (에러 메시지 출력 방지)
    console.error = jest.fn()
  })

  afterEach(() => {
    // console.error 복원
    console.error = originalConsoleError
  })

  test("자식 컴포넌트가 정상적으로 렌더링되어야 함", () => {
    render(
      <ErrorBoundary>
        <div>정상 컴포넌트</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText("정상 컴포넌트")).toBeInTheDocument()
  })

  test("에러 발생 시 에러 UI가 표시되어야 함", () => {
    // 에러 이벤트 시뮬레이션
    const ErrorComponent = () => {
      React.useEffect(() => {
        const errorEvent = new ErrorEvent("error", {
          error: new Error("테스트 에러"),
          message: "테스트 에러 메시지",
        })
        window.dispatchEvent(errorEvent)
      }, [])

      return <div>에러 발생 컴포넌트</div>
    }

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument()
    expect(screen.getByText("애플리케이션에서 예상치 못한 오류가 발생했습니다.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "페이지 새로고침" })).toBeInTheDocument()
  })

  test("새로고침 버튼 클릭 시 페이지가 새로고침되어야 함", () => {
    // location.reload 모킹
    const originalReload = window.location.reload
    window.location.reload = jest.fn()

    // 에러 이벤트 시뮬레이션
    const ErrorComponent = () => {
      React.useEffect(() => {
        const errorEvent = new ErrorEvent("error", {
          error: new Error("테스트 에러"),
          message: "테스트 에러 메시지",
        })
        window.dispatchEvent(errorEvent)
      }, [])

      return <div>에러 발생 컴포넌트</div>
    }

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>,
    )

    // 새로고침 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: "페이지 새로고침" }))

    expect(window.location.reload).toHaveBeenCalled()

    // location.reload 복원
    window.location.reload = originalReload
  })
})
