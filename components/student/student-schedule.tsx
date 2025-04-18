"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Schedule {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
}

interface StudentScheduleProps {
  studentId: string
}

export function StudentSchedule({ studentId }: StudentScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const { data, error } = await supabase
          .from("study_schedules")
          .select("*")
          .eq("student_id", studentId)
          .order("start_time", { ascending: true })
          .limit(5)

        if (error) {
          console.error("Error fetching schedules:", error)
          return
        }

        setSchedules(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [studentId, supabase])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">일정을 불러오는 중...</CardContent>
      </Card>
    )
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">예정된 일정이 없습니다.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => {
        const startTime = new Date(schedule.start_time)
        const endTime = new Date(schedule.end_time)

        return (
          <Card key={schedule.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{schedule.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {format(startTime, "PPP", { locale: ko })} {format(startTime, "p", { locale: ko })} -{" "}
                {format(endTime, "p", { locale: ko })}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{schedule.description || "설명 없음"}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
