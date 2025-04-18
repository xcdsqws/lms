"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { startStudyTimeLog, endStudyTimeLog } from "@/actions/study-log-actions"
import { Play, Pause, StopCircle } from "lucide-react"

interface Subject {
  id: string
  name: string
}

interface StudyTimeTrackerProps {
  subjects: Subject[]
  userId: string
}

export function StudyTimeTracker({ subjects, userId }: StudyTimeTrackerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [pausedTime, setPausedTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)
  const { toast } = useToast()

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":")
  }

  const handleStart = async () => {
    if (!selectedSubject) {
      toast({
        title: "과목을 선택하세요",
        description: "공부 시간을 기록할 과목을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    if (isPaused) {
      // 일시정지 상태에서 재개
      setIsPaused(false)
      setStartTime(new Date(Date.now() - pausedTime))

      const id = setInterval(() => {
        setElapsedTime(Date.now() - (startTime?.getTime() || 0) - pausedTime)
      }, 1000)

      setIntervalId(id)
    } else {
      // 새로 시작
      const now = new Date()
      setStartTime(now)
      setElapsedTime(0)
      setPausedTime(0)

      const result = await startStudyTimeLog(selectedSubject)

      if (result.error) {
        toast({
          title: "오류 발생",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setCurrentLogId(result.logId)

      const id = setInterval(() => {
        setElapsedTime(Date.now() - now.getTime())
      }, 1000)

      setIntervalId(id)
      setIsRunning(true)

      toast({
        title: "공부 시간 측정 시작",
        description: `${subjects.find((s) => s.id === selectedSubject)?.name} 과목 공부 시간 측정을 시작합니다.`,
      })
    }
  }

  const handlePause = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setPausedTime(pausedTime + (Date.now() - (startTime?.getTime() || 0) - pausedTime))
    setIsPaused(true)
  }

  const handleStop = async () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    if (currentLogId) {
      const totalElapsedTime = isPaused ? pausedTime : Date.now() - (startTime?.getTime() || 0)

      const durationMinutes = Math.ceil(totalElapsedTime / 60000) // 밀리초를 분으로 변환

      const result = await endStudyTimeLog(currentLogId, durationMinutes)

      if (result.error) {
        toast({
          title: "오류 발생",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "공부 시간 기록 완료",
          description: `${formatTime(totalElapsedTime)} 동안 공부한 시간이 기록되었습니다.`,
        })
      }
    }

    setIsRunning(false)
    setIsPaused(false)
    setStartTime(null)
    setPausedTime(0)
    setElapsedTime(0)
    setCurrentLogId(null)
  }

  const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name || ""
  const timerStatus = isRunning ? (isPaused ? "일시정지됨" : "실행 중") : "정지됨"

  return (
    <Card>
      <CardHeader>
        <CardTitle>공부 시간 측정</CardTitle>
        <CardDescription>과목을 선택하고 공부 시간을 측정하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedSubject}
          onValueChange={setSelectedSubject}
          disabled={isRunning || isPaused}
          aria-label="과목 선택"
        >
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

        <div className="flex justify-center py-4">
          <div
            className="text-4xl font-mono font-bold"
            aria-live="polite"
            aria-label={`경과 시간: ${formatTime(elapsedTime)}, 상태: ${timerStatus}, 과목: ${selectedSubjectName}`}
          >
            {formatTime(elapsedTime)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        {!isRunning && !isPaused && (
          <Button onClick={handleStart} className="gap-2" aria-label="공부 시간 측정 시작">
            <Play className="h-4 w-4" />
            시작
          </Button>
        )}

        {isRunning && !isPaused && (
          <Button onClick={handlePause} variant="outline" className="gap-2" aria-label="공부 시간 측정 일시정지">
            <Pause className="h-4 w-4" />
            일시정지
          </Button>
        )}

        {isPaused && (
          <Button onClick={handleStart} variant="outline" className="gap-2" aria-label="공부 시간 측정 계속하기">
            <Play className="h-4 w-4" />
            계속하기
          </Button>
        )}

        {(isRunning || isPaused) && (
          <Button onClick={handleStop} variant="destructive" className="gap-2" aria-label="공부 시간 측정 종료">
            <StopCircle className="h-4 w-4" />
            종료
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
