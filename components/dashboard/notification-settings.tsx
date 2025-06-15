"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Bell, Mail, Smartphone, Info, Send } from "lucide-react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { NotificationService } from "@/lib/notification-service"

export function NotificationSettings() {
  const { user } = useSupabase()
  const [settings, setSettings] = useState({
    waterLevelAlerts: {
      enabled: true,
      threshold: 2.0,
      email: true,
      push: false,
      frequency: "immediate",
    },
    weeklyReports: {
      enabled: true,
      email: true,
      day: "monday",
      time: "09:00",
    },
    maintenanceAlerts: {
      enabled: true,
      email: true,
      push: true,
    },
    systemNotifications: {
      enabled: true,
      email: false,
      push: true,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("email_settings").select("*").eq("user_id", user?.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading settings:", error)
        return
      }

      if (data) {
        setSettings({
          waterLevelAlerts: {
            enabled: data.critical_alerts,
            threshold: data.critical_threshold,
            email: data.email_notifications,
            push: true,
            frequency: "immediate",
          },
          weeklyReports: {
            enabled: data.weekly_reports,
            email: data.email_notifications,
            day: data.report_day,
            time: data.report_time,
          },
          maintenanceAlerts: {
            enabled: data.maintenance_alerts,
            email: data.email_notifications,
            push: true,
          },
          systemNotifications: {
            enabled: true,
            email: false,
            push: true,
          },
        })
      }
    } catch (error) {
      console.error("Exception loading settings:", error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      const settingsData = {
        user_id: user?.id,
        email_notifications: settings.waterLevelAlerts.email,
        weekly_reports: settings.weeklyReports.enabled,
        critical_alerts: settings.waterLevelAlerts.enabled,
        maintenance_alerts: settings.maintenanceAlerts.enabled,
        report_day: settings.weeklyReports.day,
        report_time: settings.weeklyReports.time,
        critical_threshold: settings.waterLevelAlerts.threshold,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("email_settings").upsert(settingsData, { onConflict: "user_id" })

      if (error) {
        throw error
      }

      // Criar notificação de confirmação
      await NotificationService.createNotification(
        user?.id || "",
        "Configurações Atualizadas",
        "Suas preferências de notificação foram salvas com sucesso.",
        "success",
        "system",
      )

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas com sucesso!",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestReport = async () => {
    setIsSendingTest(true)

    try {
      const success = await NotificationService.sendWeeklyReportNotification(
        user?.id || "",
        user?.email || "",
        user?.user_metadata?.full_name || user?.email || "",
      )

      if (success) {
        toast({
          title: "Relatório de teste enviado",
          description: `Um relatório de teste foi enviado para ${user?.email}`,
        })
      } else {
        toast({
          title: "Erro no envio",
          description: "Houve um problema ao enviar o relatório de teste.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar relatório de teste.",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Informações sobre onde as notificações são enviadas */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Onde você receberá as notificações:</strong>
          <br />• <strong>Email:</strong> {user?.email}
          <br />• <strong>In-app:</strong> Ícone de sino na barra superior (sempre ativo)
          <br />• <strong>Push:</strong> Notificações do navegador (quando habilitadas)
        </AlertDescription>
      </Alert>

      {/* Alertas de Nível de Água */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Alertas de Nível de Água
          </CardTitle>
          <CardDescription>
            Configure alertas quando os níveis de água atingirem valores críticos.
            <br />
            <strong>Onde será enviado:</strong> Email ({user?.email}) + Notificação in-app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="water-alerts">Ativar alertas de nível de água</Label>
              <p className="text-sm text-muted-foreground">Receba notificações quando os níveis forem críticos</p>
            </div>
            <Switch
              id="water-alerts"
              checked={settings.waterLevelAlerts.enabled}
              onCheckedChange={(checked) => updateSetting("waterLevelAlerts", "enabled", checked)}
            />
          </div>

          {settings.waterLevelAlerts.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label>Nível crítico de água (metros)</Label>
                  <div className="mt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Alertar quando atingir:</span>
                      <span className="text-sm font-medium">{settings.waterLevelAlerts.threshold}m</span>
                    </div>
                    <Slider
                      value={[settings.waterLevelAlerts.threshold]}
                      onValueChange={(value) => updateSetting("waterLevelAlerts", "threshold", value[0])}
                      max={5}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>0.5m</span>
                      <span>5.0m</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Frequência dos alertas</Label>
                  <Select
                    value={settings.waterLevelAlerts.frequency}
                    onValueChange={(value) => updateSetting("waterLevelAlerts", "frequency", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediato</SelectItem>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Métodos de notificação</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Switch
                      checked={settings.waterLevelAlerts.email}
                      onCheckedChange={(checked) => updateSetting("waterLevelAlerts", "email", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Notificação push</span>
                    </div>
                    <Switch
                      checked={settings.waterLevelAlerts.push}
                      onCheckedChange={(checked) => updateSetting("waterLevelAlerts", "push", checked)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Relatórios Semanais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-500" />
            Relatórios Semanais
          </CardTitle>
          <CardDescription>
            Receba um resumo semanal dos dados dos seus sensores.
            <br />
            <strong>Onde será enviado:</strong> Email ({user?.email}) + Confirmação in-app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-reports">Ativar relatórios semanais</Label>
              <p className="text-sm text-muted-foreground">Receba um resumo das atividades da semana</p>
            </div>
            <Switch
              id="weekly-reports"
              checked={settings.weeklyReports.enabled}
              onCheckedChange={(checked) => updateSetting("weeklyReports", "enabled", checked)}
            />
          </div>

          {settings.weeklyReports.enabled && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Dia da semana</Label>
                  <Select
                    value={settings.weeklyReports.day}
                    onValueChange={(value) => updateSetting("weeklyReports", "day", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Segunda-feira</SelectItem>
                      <SelectItem value="tuesday">Terça-feira</SelectItem>
                      <SelectItem value="wednesday">Quarta-feira</SelectItem>
                      <SelectItem value="thursday">Quinta-feira</SelectItem>
                      <SelectItem value="friday">Sexta-feira</SelectItem>
                      <SelectItem value="saturday">Sábado</SelectItem>
                      <SelectItem value="sunday">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="report-time">Horário</Label>
                  <Input
                    id="report-time"
                    type="time"
                    value={settings.weeklyReports.time}
                    onChange={(e) => updateSetting("weeklyReports", "time", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Enviar por email</span>
                </div>
                <Switch
                  checked={settings.weeklyReports.email}
                  onCheckedChange={(checked) => updateSetting("weeklyReports", "email", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Testar relatório semanal</p>
                  <p className="text-xs text-muted-foreground">Envie um relatório de teste para verificar o formato</p>
                </div>
                <Button variant="outline" size="sm" onClick={sendTestReport} disabled={isSendingTest}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSendingTest ? "Enviando..." : "Enviar Teste"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Outras Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Outras Notificações</CardTitle>
          <CardDescription>Configure outras notificações do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Alertas de manutenção</Label>
              <p className="text-sm text-muted-foreground">Notificações sobre sensores que precisam de manutenção</p>
            </div>
            <Switch
              checked={settings.maintenanceAlerts.enabled}
              onCheckedChange={(checked) => updateSetting("maintenanceAlerts", "enabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações do sistema</Label>
              <p className="text-sm text-muted-foreground">Atualizações e informações importantes do sistema</p>
            </div>
            <Switch
              checked={settings.systemNotifications.enabled}
              onCheckedChange={(checked) => updateSetting("systemNotifications", "enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}
