"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

interface EvaluationTrend {
  date: string
  formattedDate: string
  satisfaction: number
  achievement: number
  focus: number
}

interface SelfEvaluationChartProps {
  evaluationTrends: EvaluationTrend[]
}

export function SelfEvaluationChart({ evaluationTrends }: SelfEvaluationChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>자기평가 추이</CardTitle>
        <CardDescription>날짜별 자기평가 점수 변화</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {evaluationTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evaluationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => [`${value}점`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="satisfaction" name="만족도" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="achievement" name="성취도" stroke="#82ca9d" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="focus" name="집중도" stroke="#ffc658" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              자기평가 데이터가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
