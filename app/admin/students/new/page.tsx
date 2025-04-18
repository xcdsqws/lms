import { requireAdmin } from "@/lib/auth"
import { StudentForm } from "@/components/admin/student-form"

export default async function NewStudentPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">학생 추가</h1>
        <p className="text-muted-foreground">새로운 학생 계정을 생성합니다.</p>
      </div>

      <StudentForm />
    </div>
  )
}
