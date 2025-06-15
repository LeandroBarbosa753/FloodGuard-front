import { getSupabaseClient } from "@/lib/supabase/client"
import { EmailService } from "@/lib/email-service"

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: "info" | "warning" | "error" | "success" = "info",
    category = "system",
    actionUrl?: string,
  ) {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title,
        message,
        type,
        category,
        action_url: actionUrl,
        read: false,
      })

      if (error) {
        console.error("Error creating notification:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Exception creating notification:", error)
      return false
    }
  }

  static async sendCriticalLevelAlert(userId: string, userEmail: string, sensorName: string, level: number) {
    // Criar notificação in-app
    await this.createNotification(
      userId,
      "Nível Crítico Detectado",
      `Sensor ${sensorName} detectou nível de água crítico: ${level}m`,
      "warning",
      "alert",
      "/dashboard/sensors",
    )

    // Enviar email
    await EmailService.sendCriticalAlert(userEmail, sensorName, level)
  }

  static async sendMaintenanceAlert(userId: string, userEmail: string, sensorName: string, reason: string) {
    // Criar notificação in-app
    await this.createNotification(
      userId,
      "Manutenção Necessária",
      `Sensor ${sensorName} precisa de manutenção: ${reason}`,
      "warning",
      "maintenance",
      "/dashboard/sensors",
    )

    // Enviar email
    await EmailService.sendMaintenanceAlert(userEmail, sensorName, reason)
  }

  static async sendWeeklyReportNotification(userId: string, userEmail: string, userName: string) {
    try {
      // Buscar dados para o relatório
      const supabase = getSupabaseClient()

      const { data: sensors } = await supabase.from("sensors").select("*").eq("user_id", userId)

      const { data: readings } = await supabase
        .from("readings")
        .select("*")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const reportData = {
        sensors: sensors || [],
        total_readings: readings?.length || 0,
        alerts: [], // Buscar alertas da semana
      }

      // Enviar email
      const emailSent = await EmailService.sendWeeklyReport(userEmail, userName, reportData)

      // Criar notificação in-app
      await this.createNotification(
        userId,
        emailSent ? "Relatório Semanal Enviado" : "Falha no Envio do Relatório",
        emailSent
          ? `Seu relatório semanal foi enviado para ${userEmail} com sucesso.`
          : `Houve um problema ao enviar o relatório semanal para ${userEmail}.`,
        emailSent ? "success" : "error",
        "report",
      )

      return emailSent
    } catch (error) {
      console.error("Error sending weekly report:", error)
      return false
    }
  }

  // Simular verificação automática de sensores
  static async checkSensorMaintenance() {
    try {
      const supabase = getSupabaseClient()

      // Buscar sensores que não tiveram leituras nas últimas 24 horas
      const { data: sensors } = await supabase
        .from("sensors")
        .select(`
          *,
          profiles!sensors_user_id_fkey(name)
        `)
        .eq("status", "active")

      for (const sensor of sensors || []) {
        const { data: recentReadings } = await supabase
          .from("readings")
          .select("*")
          .eq("sensor_id", sensor.id)
          .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (!recentReadings || recentReadings.length === 0) {
          // Sensor sem leituras recentes - enviar alerta de manutenção
          const { data: user } = await supabase.auth.getUser()
          if (user.user) {
            await this.sendMaintenanceAlert(
              sensor.user_id,
              user.user.email || "",
              sensor.name,
              "Sensor sem leituras nas últimas 24 horas",
            )
          }
        }
      }
    } catch (error) {
      console.error("Error checking sensor maintenance:", error)
    }
  }
}
