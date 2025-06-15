"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FloodGuardLogo } from "@/components/flood-guard-logo"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting to sign in with:", { email })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        setError(error.message)
        throw error
      }

      console.log("Login successful:", data)

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to login. Please check your credentials and try again.")
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting to sign in with Google")

      // Get the current URL for proper redirect
      const origin = window.location.origin

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google login error:", error)
        setError(error.message)

        // If we get a redirect error, it's likely due to misconfigured callback URL
        if (error.message.includes("redirect") || error.message.includes("callback")) {
          router.push("/auth/setup-guide")
          return
        }

        throw error
      }

      console.log("Google OAuth initiated:", data)
      // No need to set loading to false here as we're redirecting
    } catch (error: any) {
      console.error("Google login error:", error)
      setError(error.message || "Failed to login with Google")
      toast({
        title: "Login failed",
        description: error.message || "Failed to login with Google",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Check if the error is related to OAuth configuration
  const isOAuthConfigError =
    error &&
    (error.includes("redirect") || error.includes("callback") || error.includes("origin") || error.includes("blocked"))

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="w-20 h-20 mb-4">
          <FloodGuardLogo />
        </div>
        <CardTitle className="text-2xl text-center">Bem-vindo ao FloodGuard</CardTitle>
        <CardDescription className="text-center">Entre com sua conta para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de autenticação</AlertTitle>
            <AlertDescription>
              {error}
              {isOAuthConfigError && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/setup-guide">Ver guia de configuração</Link>
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
          </div>
        </div>
        <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Entrar com Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary hover:underline">
          Não tem uma conta? Cadastre-se
        </Link>
      </CardFooter>
    </Card>
  )
}
