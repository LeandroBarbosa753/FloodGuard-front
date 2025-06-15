"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { NotificationService } from "@/lib/notification-service"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Bell, AlertTriangle, Mail, Wrench } from "lucide-react"

export function NotificationSimulator() {
  const { user } = useSupabase()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const simulateAlert = async (type: string) => {
    if (!user) return

    setIsLoading(type)

    try {
      switch (type) {
        case "critical":
          await NotificationService.sendCriticalLevelAlert(user.id, user.email || "", "Sensor Rio Tietê", 2.8)
          toast({
            title: "Alerta crítico simulado",
            description: "Notificação de nível crítico enviada!",
          })
          break

        case "maintenance":
          await NotificationService.sendMaintenanceAlert(
            user.id,
            user.email || "",
            "Sensor Rio Pinheiros",
            "Sensor sem leituras nas últimas 24 horas",
          )
          toast({
            title: "Alerta de manutenção simulado",
            description: "Notificação de manutenção enviada!",
          })
          break

        case "report":
          await NotificationService.sendWeeklyReportNotification(
            user.id,
            user.email || "",
            user.user_metadata?.full_name || user.email || "",
          )
          toast({
            title: "Relatório semanal simulado",
            description: "Relatório semanal enviado!",
          })
          break

        case "system":
          await NotificationService.createNotification(
            user.id,
            "Atualização do Sistema",
            "O FloodGuard foi atualizado com novas funcionalidades de monitoramento avançado.",
            "info",
            "system",
          )
          toast({
            title: "Notificação do sistema criada",
            description: "Nova notificação in-app adicionada!",
          })
          break
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao simular notificação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Simulador de Notificações
        </CardTitle>
        <CardDescription>Teste o sistema de notificações enviando alertas simulados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Alerta Crítico</p>
                  <p className="text-xs text-muted-foreground">Nível de água crítico</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAlert("critical")}
                disabled={isLoading === "critical"}
              >
                {isLoading === "critical" ? "Enviando..." : "Simular"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Manutenção</p>
                  <p className="text-xs text-muted-foreground">Sensor precisa de atenção</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAlert("maintenance")}
                disabled={isLoading === "maintenance"}
              >
                {isLoading === "maintenance" ? "Enviando..." : "Simular"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Relatório Semanal</p>
                  <p className="text-xs text-muted-foreground">Email com resumo</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAlert("report")}
                disabled={isLoading === "report"}
              >
                {isLoading === "report" ? "Enviando..." : "Simular"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Sistema</p>
                  <p className="text-xs text-muted-foreground">Notificação in-app</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => simulateAlert("system")}
                disabled={isLoading === "system"}
              >
                {isLoading === "system" ? "Criando..." : "Simular"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Como testar:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• Clique em "Simular" para enviar notificações de teste</li>
            <li>• Verifique o ícone de sino na navbar para notificações in-app</li>
            <li>• Emails são simulados (verifique o console do navegador)</li>
            <li>• Acesse a página de Notificações para ver o histórico</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
