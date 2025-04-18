"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface StudyLog {
  id: string
  content: string
  study_date: string
  subject_id: string
  subjects: {
    name: string
  }
}

interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface StudyLogListProps {
  studyLogs: StudyLog[]
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
}

export function StudyLogList({ studyLogs, pagination, onPageChange }: StudyLogListProps) {
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1)

  // 날짜별로 그룹화
  const groupedLogs = studyLogs.reduce(
    (acc, log) => {
      if (!acc[log.study_date]) {
        acc[log.study_date] = []
      }
      acc[log.study_date].push(log)
      return acc
    },
    {} as Record<string, StudyLog[]>,
  )

  // 날짜 내림차순으로 정렬
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  const handlePageChange = (page: number) => {
    if (page < 1 || page > (pagination?.totalPages || 1)) return
    setCurrentPage(page)
    if (onPageChange) onPageChange(page)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>공부 기록</CardTitle>
        <CardDescription>날짜별 공부 내용 기록</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date} className="space-y-4">
                <h3 className="font-medium text-lg">{format(parseISO(date), "PPP (EEEE)", { locale: ko })}</h3>
                <div className="space-y-4">
                  {groupedLogs[date].map((log) => (
                    <div key={log.id} className="rounded-lg border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{log.subjects.name}</h4>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{log.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Alert variant="default" className="bg-muted/50">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>공부 기록이 없습니다. 공부 내용을 기록하면 여기에 표시됩니다.</AlertDescription>
            </Alert>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              {currentPage} / {pagination.totalPages} 페이지
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
