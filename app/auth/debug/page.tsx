"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AuthDebugPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string>("")
  const [supabaseKey, setSupabaseKey] = useState<string>("")
  const [redirectUrl, setRedirectUrl] = useState<string>("")
  const [authProviders, setAuthProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get environment variables
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set")

    // Mask the key for security
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "Not set"
    setSupabaseKey(key.substring(0, 5) + "..." + key.substring(key.length - 5))

    // Get the redirect URL
    setRedirectUrl(window.location.origin + "/auth/callback")

    // Check auth providers
    const checkAuthProviders = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        // This is just a placeholder since we can't directly query available providers
        setAuthProviders([
          { name: "Google", status: "Configured in Supabase dashboard" },
          { name: "Email/Password", status: "Available" },
        ])
      } catch (err: any) {
        console.error("Error checking auth providers:", err)
        setError(err.message || "Failed to check auth providers")
      } finally {
        setLoading(false)
      }
    }

    checkAuthProviders()
  }, [])

  const testGoogleAuth = async () => {
    try {
      setLoading(true)
      const supabase = createClientComponentClient()

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }

      // We won't reach here if redirect is successful
    } catch (err: any) {
      console.error("Error testing Google auth:", err)
      setError(err.message || "Failed to test Google authentication")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>Check your authentication configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Environment Variables</h3>
            <div className="rounded-md bg-muted p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</div>
                <div>{supabaseUrl}</div>
                <div className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
                <div>{supabaseKey}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Redirect URL</h3>
            <div className="rounded-md bg-muted p-4">
              <p className="break-all">{redirectUrl}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Make sure this URL is added to your allowed redirect URLs in the Supabase dashboard and Google OAuth
                settings.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Authentication Providers</h3>
            <div className="rounded-md bg-muted p-4">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <ul className="space-y-2">
                  {authProviders.map((provider) => (
                    <li key={provider.name} className="flex justify-between">
                      <span>{provider.name}</span>
                      <span>{provider.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Test Authentication</h3>
            <div className="flex justify-center">
              <Button onClick={testGoogleAuth} disabled={loading}>
                Test Google Authentication
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Common Issues</h3>
            <div className="rounded-md bg-muted p-4">
              <ul className="list-disc pl-5 space-y-1">
                <li>Redirect URL not configured in Supabase dashboard</li>
                <li>Redirect URL not configured in Google OAuth settings</li>
                <li>Google OAuth credentials are incorrect</li>
                <li>CORS issues (blocked content)</li>
                <li>Environment variables not set correctly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
