"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SetupGuidePage() {
  const [origin, setOrigin] = useState("")
  const [callbackUrl, setCallbackUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState("")

  useEffect(() => {
    // Get the current origin
    setOrigin(window.location.origin)
    setCallbackUrl(`${window.location.origin}/auth/callback`)

    // Get Supabase URL from env
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container flex min-h-screen w-full flex-col items-center justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>OAuth Setup Guide</CardTitle>
          <CardDescription>Configure your OAuth providers correctly for FloodGuard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Your OAuth callback URL is incorrectly configured. Follow this guide to fix it.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="google">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">Google OAuth</TabsTrigger>
              <TabsTrigger value="supabase">Supabase Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 1: Google Cloud Console</h3>
                <p className="text-sm text-muted-foreground">
                  Go to the Google Cloud Console, navigate to "APIs & Services" → "Credentials", and edit your OAuth 2.0
                  Client ID.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 2: Configure Authorized JavaScript Origins</h3>
                <div className="rounded-md border p-4">
                  <Label htmlFor="origin">Add this URL to "Authorized JavaScript origins":</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input id="origin" value={origin} readOnly />
                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(origin)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 3: Configure Authorized Redirect URIs</h3>
                <div className="rounded-md border p-4">
                  <Label htmlFor="callback">Add this URL to "Authorized redirect URIs":</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input id="callback" value={callbackUrl} readOnly />
                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(callbackUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="supabase" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 1: Supabase Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Go to your Supabase project dashboard, navigate to "Authentication" → "Providers" → "Google".
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 2: Update Callback URL</h3>
                <div className="rounded-md border p-4">
                  <Label htmlFor="supabase-callback">Replace the current callback URL with:</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input id="supabase-callback" value={callbackUrl} readOnly />
                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(callbackUrl)}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The current URL is likely set to: {supabaseUrl}/auth/v1/callback
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 3: Save Changes</h3>
                <p className="text-sm text-muted-foreground">
                  After updating the callback URL, click "Save" to apply your changes.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="rounded-md bg-muted p-4">
            <h3 className="font-medium">After completing these steps:</h3>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>Clear your browser cache and cookies</li>
              <li>Restart your application if needed</li>
              <li>Try logging in with Google again</li>
            </ol>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <a href="/login">Return to Login</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
