"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { BookOpen, Calendar, Home, LogOut, Settings, FileText, Bell, BookMarked, BarChart, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  {
    title: "대시보드",
    href: "/student/dashboard",
    icon: Home,
  },
  {
    title: "과목",
    href: "/student/subjects",
    icon: BookOpen,
  },
  {
    title: "과제",
    href: "/student/assignments",
    icon: FileText,
  },
  {
    title: "일정",
    href: "/student/schedule",
    icon: Calendar,
  },
  {
    title: "공지사항",
    href: "/student/announcements",
    icon: Bell,
  },
  {
    title: "공부 기록",
    href: "/student/study-log",
    icon: BookMarked,
  },
  {
    title: "학습 분석",
    href: "/student/analytics",
    icon: BarChart,
  },
  {
    title: "설정",
    href: "/student/settings",
    icon: Settings,
  },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/student/dashboard" className="flex items-center">
          <span className="text-lg font-bold">학습 관리 시스템</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                  pathname === item.href ? "bg-gray-100 text-gray-900" : "",
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </>
  )

  // 모바일 화면에서는 Sheet 컴포넌트 사용
  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full flex-col">{SidebarContent()}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 데스크톱 사이드바 */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white">{SidebarContent()}</div>
    </>
  )
}
