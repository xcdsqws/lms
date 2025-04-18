"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface FormData {
  email: string
  password: string
  full_name: string
  school: string
  grade: string
  class_number: string
  student_number: string
}

export function StudentForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    full_name: "",
    school: "",
    grade: "",
    class_number: "",
    student_number: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
        },
      })

      if (authError) {
        setError(`사용자 생성 오류: ${authError.message}`)
        return
      }

      // 2. 프로필 업데이트
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          school: formData.school,
          grade: Number.parseInt(formData.grade),
          class_number: Number.parseInt(formData.class_number),
          student_number: Number.parseInt(formData.student_number),
          role: "student",
        })
        .eq("id", authData.user.id)

      if (profileError) {
        setError(`프로필 업데이트 오류: ${profileError.message}`)
        return
      }

      setSuccess(true)
      // 폼 초기화
      setFormData({
        email: "",
        password: "",
        full_name: "",
        school: "",
        grade: "",
        class_number: "",
        student_number: "",
      })

      // 3초 후 학생 목록 페이지로 이동
      setTimeout(() => {
        router.push("/admin/students")
        router.refresh()
      }, 3000)
    } catch (error) {
      setError("학생 계정 생성 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>학생 정보</CardTitle>
        <CardDescription>새로운 학생의 계정 정보와 학적 정보를 입력하세요.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>학생 계정이 성공적으로 생성되었습니다. 학생 목록 페이지로 이동합니다.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">이름</Label>
            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">학교</Label>
            <Input id="school" name="school" value={formData.school} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">학년</Label>
              <Input
                id="grade"
                name="grade"
                type="number"
                min="1"
                max="6"
                value={formData.grade}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_number">반</Label>
              <Input
                id="class_number"
                name="class_number"
                type="number"
                min="1"
                value={formData.class_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_number">번호</Label>
              <Input
                id="student_number"
                name="student_number"
                type="number"
                min="1"
                value={formData.student_number}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            학생 추가
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
