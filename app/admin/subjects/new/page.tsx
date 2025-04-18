"use client"

import { createSubject } from "@/app/actions/subjects"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewSubjectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await createSubject(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.success })
        // 성공 시 3초 후 목록 페이지로 이동
        setTimeout(() => {
          router.push("/admin/subjects")
        }, 3000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "과목 생성 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/subjects" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          과목 목록으로 돌아가기
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 과목 추가</CardTitle>
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
                <Label htmlFor="title">과목명</Label>
                <Input id="title" name="title" placeholder="예: 수학, 영어, 과학" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" name="description" placeholder="과목에 대한 설명을 입력하세요" rows={5} />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "처리 중..." : "과목 추가"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
