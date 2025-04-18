"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface Assignment {
  id: string
  title: string
  description: string | null
  due_date: string | null
  subjects: {
    name: string
  } | null
}

interface StudentAssignmentListProps {
  assignments: Assignment[]
}

export function StudentAssignmentList({ assignments }: StudentAssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">현재 진행 중인 과제가 없습니다.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
        const isOverdue = dueDate ? dueDate < new Date() : false

        return (
          <Card key={assignment.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                {dueDate && (
                  <Badge variant={isOverdue ? "destructive" : "outline"}>
                    {isOverdue
                      ? `기한 만료: ${formatDistanceToNow(dueDate, { addSuffix: true, locale: ko })}`
                      : `마감: ${formatDistanceToNow(dueDate, { addSuffix: true, locale: ko })}`}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{assignment.subjects?.name || "과목 없음"}</div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{assignment.description || "설명 없음"}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
