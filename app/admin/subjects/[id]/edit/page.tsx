"use client"

import { getSubjectById, updateSubject } from "@/app/actions/subjects"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditSubjectPage({ params }: { params: { id: string } }) {
  const [subject, setSubject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const result = await getSubjectById(params.id)

        if (result.error) {
          setMessage({ type: "error", text: result.error })
        } else if (result.subject) {
          setSubject(result.subject)
        }
      } catch (error) {
        setMessage({ type: "error", text: "과목 정보를 불러오는 중 오류가 발생했습니다." })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubject()
  }, [params.id])

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    setMessage(null)

    try {
      const result = await updateSubject(params.id, formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.success })
        // 성공 시 3초 후 상세 페이지로 이동
        setTimeout(() => {
          router.push(`/admin/subjects/${params.id}`)
        }, 3000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "과목 수정 중 오류가 발생했습니다." })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href={`/admin/subjects/${params.id}`} className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            과목 상세 페이지로 돌아가기
          </Link>
        </div>

        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!subject && !isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/subjects" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            과목 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">과목을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href={`/admin/subjects/${params.id}`} className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          과목 상세 페이지로 돌아가기
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>과목 수정</CardTitle>
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
                <Input
                  id="title"
                  name="title"
                  defaultValue={subject?.title || ""}
                  placeholder="예: 수학, 영어, 과학"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={subject?.description || ""}
                  placeholder="과목에 대한 설명을 입력하세요"
                  rows={5}
                />
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
