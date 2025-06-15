interface WeeklyReportData {
  user: {
    name: string
    email: string
  }
  period: {
    start: string
    end: string
  }
  sensors: Array<{
    name: string
    location: string
    status: string
    readings_count: number
    avg_level: number
    max_level: number
    min_level: number
  }>
  summary: {
    total_sensors: number
    active_sensors: number
    total_readings: number
    avg_temperature: number
    avg_turbidity: number
    avg_conductivity: number
  }
  alerts: Array<{
    sensor_name: string
    level: number
    timestamp: string
  }>
}

export function WeeklyReportTemplate({ data }: { data: WeeklyReportData }) {
  // Função helper para formatar números com segurança
  const safeToFixed = (value: any, decimals = 2): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "0.00"
    }
    return Number(value).toFixed(decimals)
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Relatório Semanal - FloodGuard</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 15px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #0ea5e9;
            display: block;
          }
          .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .table th,
          .table td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .table th {
            background-color: #f1f5f9;
            font-weight: 600;
            color: #475569;
            font-size: 14px;
          }
          .table td {
            font-size: 14px;
          }
          .status-active {
            color: #059669;
            font-weight: 500;
          }
          .status-inactive {
            color: #dc2626;
            font-weight: 500;
          }
          .status-maintenance {
            color: #d97706;
            font-weight: 500;
          }
          .alert-item {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 8px;
          }
          .alert-sensor {
            font-weight: 600;
            color: #92400e;
          }
          .alert-details {
            font-size: 14px;
            color: #78350f;
            margin-top: 4px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            font-size: 12px;
            color: #64748b;
            margin: 5px 0;
          }
          .button {
            display: inline-block;
            background-color: #0ea5e9;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 15px 0;
          }
          .download-section {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <div className="logo">🌊</div>
            <h1 style={{ margin: 0, fontSize: "24px" }}>Relatório Semanal FloodGuard</h1>
            <p style={{ margin: "10px 0 0", opacity: 0.9 }}>
              {data.period.start} - {data.period.end}
            </p>
          </div>

          {/* Content */}
          <div className="content">
            {/* Greeting */}
            <div className="section">
              <p>
                Olá <strong>{data.user.name}</strong>,
              </p>
              <p>
                Aqui está o seu relatório semanal do FloodGuard com um resumo das atividades dos seus sensores de
                monitoramento de água.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="section">
              <h2 className="section-title">📊 Resumo da Semana</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{data.summary.total_sensors || 0}</span>
                  <span className="stat-label">Sensores</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{data.summary.active_sensors || 0}</span>
                  <span className="stat-label">Ativos</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{data.summary.total_readings || 0}</span>
                  <span className="stat-label">Leituras</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{safeToFixed(data.summary.avg_temperature, 1)}°C</span>
                  <span className="stat-label">Temp. Média</span>
                </div>
              </div>
            </div>

            {/* Sensors Table */}
            <div className="section">
              <h2 className="section-title">🔧 Status dos Sensores</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sensor</th>
                    <th>Status</th>
                    <th>Leituras</th>
                    <th>Nível Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.sensors || []).map((sensor, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{sensor.name || "Sensor sem nome"}</strong>
                        <br />
                        <small style={{ color: "#64748b" }}>{sensor.location || "Localização não informada"}</small>
                      </td>
                      <td
                        className={
                          sensor.status === "active"
                            ? "status-active"
                            : sensor.status === "maintenance"
                              ? "status-maintenance"
                              : "status-inactive"
                        }
                      >
                        {sensor.status === "active"
                          ? "Ativo"
                          : sensor.status === "maintenance"
                            ? "Manutenção"
                            : "Inativo"}
                      </td>
                      <td>{sensor.readings_count || 0}</td>
                      <td>{safeToFixed(sensor.avg_level)}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quality Indicators */}
            <div className="section">
              <h2 className="section-title">🧪 Indicadores de Qualidade</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{safeToFixed(data.summary.avg_temperature, 1)}°C</span>
                  <span className="stat-label">Temperatura</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{safeToFixed(data.summary.avg_turbidity, 1)} NTU</span>
                  <span className="stat-label">Turbidez</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{safeToFixed(data.summary.avg_conductivity, 0)} µS/cm</span>
                  <span className="stat-label">Condutividade</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {data.alerts && data.alerts.length > 0 && (
              <div className="section">
                <h2 className="section-title">⚠️ Alertas da Semana</h2>
                {data.alerts.map((alert, index) => (
                  <div key={index} className="alert-item">
                    <div className="alert-sensor">{alert.sensor_name}</div>
                    <div className="alert-details">
                      Nível crítico detectado: {safeToFixed(alert.level)}m em{" "}
                      {new Date(alert.timestamp).toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Download Section */}
            <div className="download-section">
              <h3 style={{ margin: "0 0 10px 0", color: "#0ea5e9" }}>📄 Download do Relatório</h3>
              <p style={{ margin: "0 0 15px 0", fontSize: "14px" }}>
                Baixe uma versão em PDF deste relatório para seus arquivos.
              </p>
              <a href="https://floodguard.vercel.app/dashboard/reports/download" className="button">
                📥 Baixar PDF
              </a>
            </div>

            {/* Call to Action */}
            <div className="section" style={{ textAlign: "center" }}>
              <a href="https://floodguard.vercel.app/dashboard" className="button">
                Ver Dashboard Completo
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p className="footer-text">
              <strong>FloodGuard</strong> - Sistema de Monitoramento de Níveis de Água
            </p>
            <p className="footer-text">Relatório gerado em {new Date().toLocaleString("pt-BR")}</p>
            <p className="footer-text">
              Para alterar suas preferências de email, acesse as{" "}
              <a href="https://floodguard.vercel.app/dashboard/settings" style={{ color: "#0ea5e9" }}>
                configurações
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
