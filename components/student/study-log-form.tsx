"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { addStudyLog } from "@/actions/study-log-actions"

interface Subject {
  id: string
  name: string
}

interface StudyLogFormProps {
  subjects: Subject[]
  userId: string
}

export function StudyLogForm({ subjects, userId }: StudyLogFormProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSubject) {
      toast({
        title: "과목을 선택하세요",
        description: "공부 기록을 저장할 과목을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "내용을 입력하세요",
        description: "공부한 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await addStudyLog(selectedSubject, content)

      if (result.error) {
        toast({
          title: "오류 발생",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "성공",
          description: result.message,
        })

        // 폼 초기화
        setContent("")
        setSelectedSubject("")

        // 페이지 새로고침
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving study log:", error)
      toast({
        title: "오류가 발생했습니다",
        description: "공부 기록을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 공부 기록</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="과목 선택" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="오늘 공부한 내용을 기록하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
