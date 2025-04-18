"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Student {
  id: string
  full_name: string | null
  username: string | null
  grade: number | null
  class_number: number | null
  student_number: number | null
  school: string | null
}

interface AdminStudentListProps {
  students: Student[]
}

export function AdminStudentList({ students }: AdminStudentListProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">등록된 학생이 없습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/students/new">학생 추가</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">학생 목록</h2>
        <Button asChild>
          <Link href="/admin/students/new">학생 추가</Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>학교</TableHead>
              <TableHead>학년</TableHead>
              <TableHead>반</TableHead>
              <TableHead>번호</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.full_name || "-"}</TableCell>
                <TableCell>{student.school || "-"}</TableCell>
                <TableCell>{student.grade || "-"}</TableCell>
                <TableCell>{student.class_number || "-"}</TableCell>
                <TableCell>{student.student_number || "-"}</TableCell>
                <TableCell>{student.username || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/students/${student.id}`}>상세</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-center">
        <Button variant="outline" asChild>
          <Link href="/admin/students">모든 학생 보기</Link>
        </Button>
      </div>
    </div>
  )
}
