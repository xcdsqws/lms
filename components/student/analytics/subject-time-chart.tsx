"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SubjectTimeChartProps {
  subjectTotalTime: Record<string, number>
}

export function SubjectTimeChart({ subjectTotalTime }: SubjectTimeChartProps) {
  // 과목별 공부 시간 차트 데이터
  const chartData = Object.entries(subjectTotalTime)
    .map(([name, minutes]) => ({
      name,
      minutes,
      hours: Math.round((minutes / 60) * 10) / 10,
    }))
    .sort((a, b) => b.minutes - a.minutes)

  return (
    <Card>
      <CardHeader>
        <CardTitle>과목별 공부 시간</CardTitle>
        <CardDescription>과목별 누적 공부 시간</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}분 (${Math.round((Number(value) / 60) * 10) / 10}시간)`,
                    "공부 시간",
                  ]}
                  labelFormatter={(value) => `${value} 과목`}
                />
                <Bar dataKey="minutes" name="공부 시간(분)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert variant="default" className="flex items-center justify-center h-full bg-muted/50">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>공부 시간 데이터가 없습니다. 공부 시간을 기록하면 여기에 표시됩니다.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
