import { redirect } from "next/navigation"
import { getServerSupabaseClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = getServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
