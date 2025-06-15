"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Server, Flag, Map, Settings, Bell } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sensores",
    href: "/dashboard/sensors",
    icon: Server,
  },
  {
    title: "Relatos",
    href: "/dashboard/reports",
    icon: Flag,
  },
  {
    title: "Mapa",
    href: "/dashboard/map",
    icon: Map,
  },
  {
    title: "Notificações",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:block w-64 border-r bg-muted/40 p-6">
      <div className="space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  )
}
