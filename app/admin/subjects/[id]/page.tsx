import { getSubjectById } from "@/app/actions/subjects"
import { checkAdmin } from "@/utils/auth-check"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, PlusCircle } from "lucide-react"
import { DeleteSubjectButton } from "./delete-button"

export default async function SubjectDetailPage({ params }: { params: { id: string } }) {
  await checkAdmin()
  const { subject, error } = await getSubjectById(params.id)

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/subjects" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            과목 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-red-50 text-red-800 p-4 rounded-md">오류: {error}</div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/admin/subjects" className="flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            과목 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">과목을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/subjects" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          과목 목록으로 돌아가기
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{subject.title}</CardTitle>
          <div className="flex space-x-2">
            <Link href={`/admin/subjects/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                수정
              </Button>
            </Link>
            <DeleteSubjectButton id={params.id} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">설명</h3>
            <p>{subject.description || "설명 없음"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">생성일</h3>
            <p>{subject.created_at ? new Date(subject.created_at).toLocaleString() : "정보 없음"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">관련 과제</h2>
        <Link href={`/admin/assignments/new?subject_id=${params.id}`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />이 과목에 과제 추가
          </Button>
        </Link>

        {/* 여기에 관련 과제 목록을 표시할 수 있습니다 */}
      </div>
    </div>
  )
}
