"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addSelfEvaluation } from "@/actions/study-log-actions"

interface SelfEvaluation {
  id: string
  satisfaction_level: number
  achievement_level: number
  focus_level: number
  reflection: string | null
  goals_for_tomorrow: string | null
}

interface SelfEvaluationFormProps {
  userId: string
  existingEvaluation?: SelfEvaluation | null
}

export function SelfEvaluationForm({ userId, existingEvaluation }: SelfEvaluationFormProps) {
  const [satisfactionLevel, setSatisfactionLevel] = useState<number>(existingEvaluation?.satisfaction_level || 3)
  const [achievementLevel, setAchievementLevel] = useState<number>(existingEvaluation?.achievement_level || 3)
  const [focusLevel, setFocusLevel] = useState<number>(existingEvaluation?.focus_level || 3)
  const [reflection, setReflection] = useState<string>(existingEvaluation?.reflection || "")
  const [goalsForTomorrow, setGoalsForTomorrow] = useState<string>(existingEvaluation?.goals_for_tomorrow || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addSelfEvaluation(
        satisfactionLevel,
        achievementLevel,
        focusLevel,
        reflection || null,
        goalsForTomorrow || null,
      )

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
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting self evaluation:", error)
      toast({
        title: "오류 발생",
        description: "자기평가를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRatingOptions = (value: number, onChange: (value: number) => void, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RadioGroup
        value={value.toString()}
        onValueChange={(val) => onChange(Number.parseInt(val))}
        className="flex space-x-2"
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="flex flex-col items-center">
            <RadioGroupItem value={rating.toString()} id={`${label}-${rating}`} className="sr-only" />
            <Label
              htmlFor={`${label}-${rating}`}
              className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border ${
                value === rating ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {rating}
            </Label>
            <span className="text-xs mt-1">
              {rating === 1
                ? "매우 낮음"
                : rating === 2
                  ? "낮음"
                  : rating === 3
                    ? "보통"
                    : rating === 4
                      ? "높음"
                      : "매우 높음"}
            </span>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 자기평가</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {renderRatingOptions(satisfactionLevel, setSatisfactionLevel, "만족도")}
          {renderRatingOptions(achievementLevel, setAchievementLevel, "성취도")}
          {renderRatingOptions(focusLevel, setFocusLevel, "집중도")}

          <div className="space-y-2">
            <Label htmlFor="reflection">오늘의 학습 성찰</Label>
            <Textarea
              id="reflection"
              placeholder="오늘 공부하면서 느낀 점, 어려웠던 점, 잘한 점 등을 기록하세요..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">내일의 학습 목표</Label>
            <Textarea
              id="goals"
              placeholder="내일 공부할 내용과 목표를 기록하세요..."
              value={goalsForTomorrow}
              onChange={(e) => setGoalsForTomorrow(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "저장 중..." : existingEvaluation ? "업데이트하기" : "저장하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
