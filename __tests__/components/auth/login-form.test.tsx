import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LoginForm } from "@/components/auth/login-form"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// 모킹
jest.mock("@/lib/supabase/client")
jest.mock("next/navigation")

describe("LoginForm 컴포넌트", () => {
  const mockSignInWithPassword = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Supabase 클라이언트 모킹
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    })

    // useRouter 모킹
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    })
  })

  test("로그인 폼이 올바르게 렌더링되어야 함", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /로그인/i })).toBeInTheDocument()
  })

  test("이메일과 비밀번호 입력 시 상태가 업데이트되어야 함", () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })

    expect(emailInput).toHaveValue("test@example.com")
    expect(passwordInput).toHaveValue("password123")
  })

  test("로그인 성공 시 페이지가 새로고침되어야 함", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const loginButton = screen.getByRole("button", { name: /로그인/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  test("로그인 실패 시 에러 메시지가 표시되어야 함", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "로그인에 실패했습니다." },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/이메일/i)
    const passwordInput = screen.getByLabelText(/비밀번호/i)
    const loginButton = screen.getByRole("button", { name: /로그인/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrong-password" } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/로그인에 실패했습니다/i)).toBeInTheDocument()
    })
  })
})
