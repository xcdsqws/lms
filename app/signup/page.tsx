"use client"

import type React from "react"

import { useState } from "react"
import { signUp } from "../actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // 클라이언트 측 유효성 검사
    if (!formData.fullName.trim()) {
      setMessage({ type: "error", text: "이름을 입력해주세요." })
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "이메일을 입력해주세요." })
      setIsLoading(false)
      return
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "유효한 이메일 주소를 입력해주세요." })
      setIsLoading(false)
      return
    }

    // 비밀번호 길이 검사
    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "비밀번호는 최소 6자 이상이어야 합니다." })
      setIsLoading(false)
      return
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." })
      setIsLoading(false)
      return
    }

    try {
      // FormData 객체 생성
      const submitData = new FormData()
      submitData.append("fullName", formData.fullName)
      submitData.append("email", formData.email)
      submitData.append("password", formData.password)

      const result = await signUp(submitData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.success })
        // 성공 시 폼 초기화
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: "회원가입 중 오류가 발생했습니다." })
      console.error("회원가입 오류:", error)
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
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">이름</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="홍길동"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
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
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">비밀번호는 최소 6자 이상이어야 합니다.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
