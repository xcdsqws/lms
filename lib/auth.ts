import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getSession() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getUserRole() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const supabase = createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  return profile?.role
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return session
}

export async function requireAdmin() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const role = await getUserRole()

  if (role !== "admin") {
    redirect("/student/dashboard")
  }

  return session
}

export async function requireStudent() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const role = await getUserRole()

  if (role !== "student") {
    redirect("/admin/dashboard")
  }

  return session
}
