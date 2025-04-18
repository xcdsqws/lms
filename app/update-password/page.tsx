"use client"

import type React from "react"

import { useState } from "react"
import { updatePassword } from "../actions/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." })
      return
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "비밀번호는 최소 6자 이상이어야 합니다." })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updatePassword(password)
      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.success })
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "비밀번호 업데이트 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">새 비밀번호 설정</CardTitle>
          <CardDescription className="text-center">새로운 비밀번호를 입력해주세요.</CardDescription>
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
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">새 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "처리 중..." : "비밀번호 변경"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
