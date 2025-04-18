import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminStudentActions } from "@/components/admin/admin-student-actions"

export default async function AdminStudentsPage() {
  await requireAdmin()
  const supabase = createClient()

  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("grade", { ascending: true })
    .order("class_number", { ascending: true })
    .order("student_number", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">학생 관리</h1>
          <p className="text-muted-foreground">학생 계정을 생성하고 관리합니다.</p>
        </div>
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
            {students && students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.full_name || "-"}</TableCell>
                  <TableCell>{student.school || "-"}</TableCell>
                  <TableCell>{student.grade || "-"}</TableCell>
                  <TableCell>{student.class_number || "-"}</TableCell>
                  <TableCell>{student.student_number || "-"}</TableCell>
                  <TableCell>{student.username || "-"}</TableCell>
                  <TableCell className="text-right">
                    <AdminStudentActions student={student} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  등록된 학생이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
