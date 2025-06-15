"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function RefreshButton({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh}>
      {children}
    </Button>
  )
}
