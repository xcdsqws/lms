"use client"

import { useState } from "react"
import { signUp } from "../actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUpPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    // 비밀번호 확인
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." })
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp(formData)
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.success })
      }
    } catch (error) {
      setMessage({ type: "error", text: "회원가입 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">아래 정보를 입력하여 계정을 생성하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              className={`mb-4 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <form action={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">이름</Label>
                <Input id="fullName" name="fullName" type="text" placeholder="홍길동" required autoComplete="name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input id="password" name="password" type="password" required autoComplete="new-password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || message?.type === "success"}>
                {isLoading ? "처리 중..." : "회원가입"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
