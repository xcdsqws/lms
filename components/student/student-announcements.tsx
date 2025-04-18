"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

export function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching announcements:", error)
          return
        }

        setAnnouncements(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">공지사항을 불러오는 중...</CardContent>
      </Card>
    )
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">공지사항이 없습니다.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const createdAt = new Date(announcement.created_at)

        return (
          <Card key={announcement.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{announcement.title}</CardTitle>
              <div className="text-sm text-muted-foreground">{format(createdAt, "PPP", { locale: ko })}</div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{announcement.content}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
