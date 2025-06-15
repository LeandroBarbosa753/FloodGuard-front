"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/providers/supabase-provider"
import { createUserProfile } from "@/app/actions/create-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function EnsureProfile() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const createProfileIfNeeded = async () => {
      setIsCreating(true)
      try {
        // First check if profile exists using client-side query
        const { data: existingProfile, error: checkError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking profile:", checkError)
        }

        // If profile doesn't exist, create it using server action
        if (!existingProfile) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email
          const avatarUrl = user.user_metadata?.avatar_url

          const result = await createUserProfile(user.id, name || "", avatarUrl)

          if (!result.success) {
            console.error("Failed to create profile:", result.error)

            // Se falhar e tivermos menos de 3 tentativas, tente novamente após um atraso
            if (retryCount < 3) {
              setRetryCount((prev) => prev + 1)
              setTimeout(() => {
                createProfileIfNeeded()
              }, 1000 * retryCount) // Atraso exponencial
              return
            }

            setError(result.error || "Failed to create profile")
          }
        }
      } catch (err) {
        console.error("Error ensuring profile:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsCreating(false)
      }
    }

    createProfileIfNeeded()
  }, [user, supabase, retryCount])

  if (!user) return null

  if (isCreating) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Setting up your account</CardTitle>
          <CardDescription>Please wait while we set up your profile...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Profile Setup Error</CardTitle>
          <CardDescription>There was a problem setting up your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Continue to Dashboard</Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
