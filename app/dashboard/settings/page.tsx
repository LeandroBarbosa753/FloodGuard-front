"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/providers/supabase-provider"
import { NotificationSettings } from "@/components/dashboard/notification-settings"
import { NotificationSimulator } from "@/components/dashboard/notification-simulator"
import { useSearchParams } from "next/navigation"

export default function SettingsPage() {
  const { user } = useSupabase()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile")
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar_url: "",
  })

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      })
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (profileError) {
        throw profileError
      }

      // Atualizar metadados do usuário
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          avatar_url: profile.avatar_url,
        },
      })

      if (userError) {
        throw userError
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      })
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || "", {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha.",
      })
    } catch (error: any) {
      console.error("Erro ao enviar email:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas configurações de conta e preferências.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="testing">Testes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais aqui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled />
                  <p className="text-sm text-muted-foreground">
                    O email não pode ser alterado. Entre em contato com o suporte se necessário.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL do Avatar</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Gerencie sua senha e configurações de segurança.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Alterar Senha</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique no botão abaixo para receber um email com instruções para redefinir sua senha.
                  </p>
                </div>
                <Button onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Email de Redefinição"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="testing">
          <div className="space-y-6">
            <NotificationSimulator />

            <Card>
              <CardHeader>
                <CardTitle>Informações de Desenvolvimento</CardTitle>
                <CardDescription>
                  Esta aba é para testes e desenvolvimento. Em produção, seria removida.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Status do Sistema:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>✅ Notificações in-app funcionando</li>
                    <li>✅ Templates de email criados</li>
                    <li>✅ Sistema de alertas implementado</li>
                    <li>⚠️ Envio real de emails (simulado no console)</li>
                    <li>⚠️ Push notifications (requer configuração adicional)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
