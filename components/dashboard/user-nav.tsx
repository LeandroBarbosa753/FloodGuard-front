"use client"

import { useRouter } from "next/navigation"
import type { User } from "@supabase/auth-helpers-nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

interface UserNavProps {
  user: User
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })

      router.push("/login")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const email = user?.email || ""
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt={user?.email || ""} />
          <AvatarFallback>{getUserInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
