import { getServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, Droplets, Thermometer, ExternalLink } from "lucide-react"
import { RefreshButton } from "@/components/dashboard/refresh-button"
import { WaterLevelChartReal } from "@/components/dashboard/water-level-chart-real"
import { AdditionalCharts } from "@/components/dashboard/additional-charts"
import Link from "next/link"

export default async function DashboardPage() {
  // Initialize with empty arrays and error state
  let sensors = []
  let readings = []
  let reports = []
  let fetchError = null
  let connectionError = false

  try {
    // Use the server supabase client
    const supabase = getServerSupabaseClient()

    // Try to fetch sensors data
    try {
      const { data: sensorData, error: sensorError } = await supabase.from("sensors").select("*")

      if (sensorError) {
        console.error("Error fetching sensors:", sensorError)
        fetchError = `Error fetching sensors: ${sensorError.message}`
      } else {
        sensors = sensorData || []

        // Only fetch readings if sensors fetch was successful
        const { data: readingData, error: readingError } = await supabase
          .from("readings")
          .select(`
            *,
            sensors!readings_sensor_id_fkey(name, location)
          `)
          .order("created_at", { ascending: false })
          .limit(50)

        if (readingError) {
          console.error("Error fetching readings:", readingError)
          // Don't set fetchError here, we can still show the page with sensor data
        } else {
          readings = readingData || []
        }

        // Fetch reports for overview
        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10)

        if (reportError) {
          console.error("Error fetching reports:", reportError)
        } else {
          reports = reportData || []
        }
      }
    } catch (error) {
      console.error("Network error when fetching data:", error)
      connectionError = true
      fetchError = "Failed to connect to the database. Please check your network connection and try again."
    }
  } catch (error) {
    console.error("Exception in dashboard:", error)
    fetchError = "An unexpected error occurred. Please try again later."
  }

  // Count active and inactive sensors
  const activeSensors = sensors?.filter((sensor) => sensor.status === "active").length || 0
  const inactiveSensors = sensors?.filter((sensor) => sensor.status === "inactive").length || 0
  const maintenanceSensors = sensors?.filter((sensor) => sensor.status === "maintenance").length || 0

  // Count reports by status
  const openReports = reports?.filter((report) => report.status === "open").length || 0
  const progressReports = reports?.filter((report) => report.status === "progress").length || 0
  const closedReports = reports?.filter((report) => report.status === "closed").length || 0

  // Calculate average water level
  const avgWaterLevel =
    readings.length > 0
      ? (readings.reduce((sum, reading) => sum + reading.water_level, 0) / readings.length).toFixed(2)
      : "0.00"

  // Get unique sensors from readings
  const sensorsWithReadings = readings.reduce((acc, reading) => {
    if (reading.sensors && !acc.find((s) => s.id === reading.sensor_id)) {
      acc.push({
        id: reading.sensor_id,
        name: reading.sensors.name,
        location: reading.sensors.location,
      })
    }
    return acc
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Monitoramento de níveis de água em tempo real.</p>
      </div>

      {fetchError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de Conexão</AlertTitle>
          <AlertDescription>
            {fetchError}
            <div className="mt-4">
              {connectionError ? (
                <div className="space-y-2">
                  <p className="text-sm">Possíveis causas:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Problemas de conexão com a internet</li>
                    <li>URL ou chave de API do Supabase incorreta</li>
                    <li>Serviço Supabase indisponível</li>
                  </ul>
                  <div className="pt-2">
                    <RefreshButton>Tentar novamente</RefreshButton>
                  </div>
                </div>
              ) : (
                <p className="text-sm">
                  Verifique se as tabelas do banco de dados foram criadas corretamente. Você pode executar o script de
                  configuração do banco de dados para criar as tabelas necessárias.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Cards de estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sensores Ativos</CardTitle>
                <Droplets className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSensors}</div>
                <p className="text-xs text-muted-foreground">
                  {inactiveSensors} inativos, {maintenanceSensors} em manutenção
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nível Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgWaterLevel}m</div>
                <p className="text-xs text-muted-foreground">
                  Dados de {readings.length} leituras de {sensorsWithReadings.length} sensores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relatos Abertos</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openReports}</div>
                <p className="text-xs text-muted-foreground">
                  {progressReports} em andamento, {closedReports} resolvidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temperatura Média</CardTitle>
                <Thermometer className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">19.5°C</div>
                <p className="text-xs text-muted-foreground">Simulado baseado em dados reais</p>
              </CardContent>
            </Card>
          </div>

          {/* Origem dos dados */}
          {sensorsWithReadings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Origem dos Dados</CardTitle>
                <CardDescription>Sensores que estão fornecendo dados para o monitoramento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {sensorsWithReadings.map((sensor) => (
                    <Link
                      key={sensor.id}
                      href={`/dashboard/sensors?sensor=${sensor.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{sensor.name}</p>
                        <p className="text-xs text-muted-foreground">{sensor.location}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráficos principais */}
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Qualidade da Água</CardTitle>
              <CardDescription>Dados dos sensores e análises de qualidade da água.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="water-level" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="water-level">Níveis de Água</TabsTrigger>
                  <TabsTrigger value="temperature">Temperatura</TabsTrigger>
                  <TabsTrigger value="turbidity">Turbidez</TabsTrigger>
                  <TabsTrigger value="conductivity">Condutividade</TabsTrigger>
                </TabsList>

                <TabsContent value="water-level">
                  <WaterLevelChartReal readings={readings} sensors={sensors} />
                </TabsContent>

                <TabsContent value="temperature">
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <h3 className="text-lg font-medium">Temperatura da Água</h3>
                      <p className="text-sm text-muted-foreground">
                        Dados simulados baseados nas leituras dos sensores
                      </p>
                    </div>
                    <AdditionalCharts readings={readings} chartType="temperature" />
                  </div>
                </TabsContent>

                <TabsContent value="turbidity">
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <h3 className="text-lg font-medium">Turbidez da Água</h3>
                      <p className="text-sm text-muted-foreground">Medições de clareza e qualidade visual da água</p>
                    </div>
                    <AdditionalCharts readings={readings} chartType="turbidity" />
                  </div>
                </TabsContent>

                <TabsContent value="conductivity">
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <h3 className="text-lg font-medium">Condutividade Elétrica</h3>
                      <p className="text-sm text-muted-foreground">
                        Indicador da quantidade de sais dissolvidos na água
                      </p>
                    </div>
                    <AdditionalCharts readings={readings} chartType="conductivity" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Resumo de atividades recentes */}
          {reports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimos relatos e atualizações do sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <Link
                      key={report.id}
                      href={`/dashboard/reports?report=${report.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.location} • {new Date(report.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            report.status === "closed"
                              ? "bg-green-100 text-green-800"
                              : report.status === "progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {report.status === "closed"
                            ? "Resolvido"
                            : report.status === "progress"
                              ? "Em Andamento"
                              : "Aberto"}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/dashboard/reports" className="text-sm text-primary hover:underline">
                    Ver todos os relatos →
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
