"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DailyChartData {
  date: string
  formattedDate: string
  minutes: number
  hours: number
}

interface DailyStudyChartProps {
  dailyChartData: DailyChartData[]
}

export function DailyStudyChart({ dailyChartData }: DailyStudyChartProps) {
  // 데이터가 있는지 확인 (0이 아닌 값이 하나라도 있는지)
  const hasData = dailyChartData.some((item) => item.minutes > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>일별 공부 시간</CardTitle>
        <CardDescription>날짜별 공부 시간 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${value}분 (${Math.round((Number(value) / 60) * 10) / 10}시간)`,
                    "공부 시간",
                  ]}
                  labelFormatter={(value) => `${value}일`}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="공부 시간(분)"
                  stroke="#82ca9d"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
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
