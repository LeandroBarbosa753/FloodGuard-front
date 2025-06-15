"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FloodGuardLogo } from "@/components/flood-guard-logo"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setIsSubmitted(true)
      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha.",
      })
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Ocorreu um erro ao tentar enviar o email de redefinição de senha.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="w-20 h-20 mb-4">
          <FloodGuardLogo />
        </div>
        <CardTitle className="text-2xl text-center">Esqueceu sua senha?</CardTitle>
        <CardDescription className="text-center">
          Digite seu email abaixo para receber um link de redefinição de senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubmitted ? (
          <div className="p-4 bg-green-50 text-green-800 rounded-md">
            <p className="text-center">
              Se um usuário com esse email existir, você receberá um link para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar link de redefinição"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline">
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  )
}
