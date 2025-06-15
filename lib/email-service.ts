import { WeeklyReportTemplate } from "@/components/email/weekly-report-template"
import { renderToString } from "react-dom/server"

interface EmailData {
  to: string
  subject: string
  html: string
}

// Simulação de serviço de email (em produção, usar Resend, SendGrid, etc.)
export class EmailService {
  static async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Em produção, aqui você integraria com um serviço real de email
      console.log("📧 Enviando email:", {
        to: data.to,
        subject: data.subject,
        html: data.html.substring(0, 100) + "...",
      })

      // Simular delay de envio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simular sucesso (95% de taxa de sucesso)
      const success = Math.random() > 0.05

      if (success) {
        console.log("✅ Email enviado com sucesso para:", data.to)
      } else {
        console.log("❌ Falha no envio do email para:", data.to)
      }

      return success
    } catch (error) {
      console.error("Erro no serviço de email:", error)
      return false
    }
  }

  static async sendWeeklyReport(userEmail: string, userName: string, reportData: any): Promise<boolean> {
    const emailData = {
      user: { name: userName, email: userEmail },
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        end: new Date().toLocaleDateString("pt-BR"),
      },
      sensors: reportData.sensors || [],
      summary: {
        total_sensors: reportData.sensors?.length || 0,
        active_sensors: reportData.sensors?.filter((s: any) => s.status === "active").length || 0,
        total_readings: reportData.total_readings || 0,
        avg_temperature: 19.5,
        avg_turbidity: 6.2,
        avg_conductivity: 245,
      },
      alerts: reportData.alerts || [],
    }

    const html = renderToString(WeeklyReportTemplate({ data: emailData }))

    return this.sendEmail({
      to: userEmail,
      subject: `FloodGuard - Relatório Semanal (${emailData.period.start} - ${emailData.period.end})`,
      html,
    })
  }

  static async sendCriticalAlert(userEmail: string, sensorName: string, level: number): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alerta Crítico - FloodGuard</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert-container { background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .alert-title { color: #dc2626; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .alert-message { color: #7f1d1d; margin-bottom: 15px; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="alert-container">
            <div class="alert-title">⚠️ Alerta Crítico de Nível de Água</div>
            <div class="alert-message">
              <p><strong>Sensor:</strong> ${sensorName}</p>
              <p><strong>Nível detectado:</strong> ${level}m</p>
              <p><strong>Horário:</strong> ${new Date().toLocaleString("pt-BR")}</p>
              <p>O nível de água atingiu um valor crítico. Verifique imediatamente a situação.</p>
            </div>
            <a href="https://floodguard.vercel.app/dashboard" class="button">Ver Dashboard</a>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: userEmail,
      subject: `🚨 FloodGuard - Alerta Crítico: ${sensorName}`,
      html,
    })
  }

  static async sendMaintenanceAlert(userEmail: string, sensorName: string, reason: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alerta de Manutenção - FloodGuard</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .maintenance-container { background-color: #fffbeb; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .maintenance-title { color: #d97706; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .maintenance-message { color: #92400e; margin-bottom: 15px; }
            .button { display: inline-block; background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="maintenance-container">
            <div class="maintenance-title">🔧 Alerta de Manutenção</div>
            <div class="maintenance-message">
              <p><strong>Sensor:</strong> ${sensorName}</p>
              <p><strong>Motivo:</strong> ${reason}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
              <p>Este sensor precisa de atenção para manter o funcionamento adequado.</p>
            </div>
            <a href="https://floodguard.vercel.app/dashboard/sensors" class="button">Gerenciar Sensores</a>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: userEmail,
      subject: `🔧 FloodGuard - Manutenção Necessária: ${sensorName}`,
      html,
    })
  }
}
