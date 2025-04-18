"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
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

interface AdminAssignmentListProps {
  assignments: Assignment[]
}

export function AdminAssignmentList({ assignments }: AdminAssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">등록된 과제가 없습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/assignments/new">과제 추가</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">과제 목록</h2>
        <Button asChild>
          <Link href="/admin/assignments/new">과제 추가</Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>과목</TableHead>
              <TableHead>마감일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
              const isOverdue = dueDate ? dueDate < new Date() : false

              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignment.subjects?.name || "-"}</TableCell>
                  <TableCell>{dueDate ? format(dueDate, "PPP", { locale: ko }) : "-"}</TableCell>
                  <TableCell>
                    {dueDate && (
                      <Badge variant={isOverdue ? "destructive" : "outline"}>
                        {isOverdue ? "기한 만료" : "진행 중"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/assignments/${assignment.id}`}>상세</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-center">
        <Button variant="outline" asChild>
          <Link href="/admin/assignments">모든 과제 보기</Link>
        </Button>
      </div>
    </div>
  )
}
