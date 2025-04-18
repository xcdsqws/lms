import { getSubjects } from "@/app/actions/subjects"
import { checkAdmin } from "@/utils/auth-check"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default async function SubjectsPage() {
  await checkAdmin()
  const { subjects, error } = await getSubjects()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">과목 관리</h1>
        <Link href="/admin/subjects/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />새 과목 추가
          </Button>
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">오류: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects &&
          subjects.map((subject) => (
            <Link href={`/admin/subjects/${subject.id}`} key={subject.id}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle>{subject.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-2">{subject.description || "설명 없음"}</p>
                </CardContent>
              </Card>
            </Link>
          ))}

        {subjects && subjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            등록된 과목이 없습니다. 새 과목을 추가해주세요.
          </div>
        )}
      </div>
    </div>
  )
}
