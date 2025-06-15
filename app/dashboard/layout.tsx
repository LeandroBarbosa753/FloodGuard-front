import type React from "react"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown"
import { FloodGuardLogo } from "@/components/flood-guard-logo"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { EnvCheckSimple } from "@/components/dashboard/env-check-simple"
import { EnsureProfile } from "@/components/auth/ensure-profile"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = getServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <FloodGuardLogo />
              </div>
              <h1 className="text-lg font-semibold">FloodGuard</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <UserNav user={session.user} />
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <DashboardNav />
          <main className="flex-1 p-6">
            <EnvCheckSimple />
            <EnsureProfile />
            {children}
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in dashboard layout:", error)
    redirect("/login?error=session")
  }
}
