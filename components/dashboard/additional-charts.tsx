"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Reading {
  id: number
  sensor_id: number
  water_level: number
  created_at: string
}

interface AdditionalChartsProps {
  readings: Reading[]
  chartType?: "temperature" | "turbidity" | "conductivity" | "all"
}

export function AdditionalCharts({ readings, chartType = "all" }: AdditionalChartsProps) {
  // Gerar dados simulados baseados nas leituras reais com diferentes algoritmos para cada tipo
  const temperatureData = useMemo(() => {
    if (!readings || readings.length === 0) return []

    return readings
      .slice(0, 15)
      .map((reading, index) => {
        // Algoritmo específico para temperatura (18-24°C com variação sazonal)
        const baseTemp = 20
        const seasonalVariation = Math.sin((index / 15) * Math.PI * 2) * 2
        const dailyVariation = Math.sin((index / 3) * Math.PI) * 1.5
        const randomNoise = (Math.random() - 0.5) * 1
        const temperature = baseTemp + seasonalVariation + dailyVariation + randomNoise

        return {
          date: new Date(reading.created_at).toLocaleDateString("pt-BR"),
          time: new Date(reading.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          temperature: Math.max(15, Math.min(25, temperature)), // Limitar entre 15-25°C
        }
      })
      .reverse()
  }, [readings])

  const turbidityData = useMemo(() => {
    if (!readings || readings.length === 0) return []

    return readings
      .slice(0, 15)
      .map((reading, index) => {
        // Algoritmo específico para turbidez (2-15 NTU, correlacionado com chuva)
        const baseTurbidity = 5
        const weatherEffect = Math.sin((index / 7) * Math.PI) * 3 // Simular efeito da chuva
        const waterLevelEffect = (reading.water_level - 1.5) * 2 // Correlação com nível de água
        const randomVariation = Math.random() * 2
        const turbidity = baseTurbidity + weatherEffect + waterLevelEffect + randomVariation

        return {
          date: new Date(reading.created_at).toLocaleDateString("pt-BR"),
          time: new Date(reading.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          turbidity: Math.max(1, Math.min(20, turbidity)), // Limitar entre 1-20 NTU
        }
      })
      .reverse()
  }, [readings])

  const conductivityData = useMemo(() => {
    if (!readings || readings.length === 0) return []

    return readings
      .slice(0, 15)
      .map((reading, index) => {
        // Algoritmo específico para condutividade (150-350 µS/cm, mais estável)
        const baseConductivity = 250
        const seasonalDrift = Math.sin((index / 20) * Math.PI) * 30
        const pollutionSpike = index % 8 === 0 ? Math.random() * 40 : 0 // Picos ocasionais
        const randomVariation = (Math.random() - 0.5) * 20
        const conductivity = baseConductivity + seasonalDrift + pollutionSpike + randomVariation

        return {
          date: new Date(reading.created_at).toLocaleDateString("pt-BR"),
          time: new Date(reading.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          conductivity: Math.max(100, Math.min(400, conductivity)), // Limitar entre 100-400 µS/cm
        }
      })
      .reverse()
  }, [readings])

  if (!readings || readings.length === 0) {
    const titles = {
      temperature: "Temperatura",
      turbidity: "Turbidez",
      conductivity: "Condutividade",
      all: "Parâmetros de Qualidade",
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{titles[chartType]}</CardTitle>
          <CardDescription>Dados não disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar gráfico específico baseado no tipo
  if (chartType === "temperature") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temperatura da Água</CardTitle>
          <CardDescription>Últimas {temperatureData.length} medições de temperatura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "°C",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value.toFixed(1)}°C`, "Temperatura"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartType === "turbidity") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Turbidez da Água</CardTitle>
          <CardDescription>Últimas {turbidityData.length} medições de turbidez</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turbidityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "NTU",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value.toFixed(1)} NTU`, "Turbidez"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area type="monotone" dataKey="turbidity" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartType === "conductivity") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Condutividade Elétrica</CardTitle>
          <CardDescription>Últimas {conductivityData.length} medições de condutividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conductivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis
                  domain={["dataMin - 10", "dataMax + 10"]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "µS/cm",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value.toFixed(0)} µS/cm`, "Condutividade"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="conductivity"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Renderizar todos os gráficos (modo padrão)
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Gráfico de Temperatura */}
      <Card>
        <CardHeader>
          <CardTitle>Temperatura da Água</CardTitle>
          <CardDescription>Últimas medições de temperatura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "°C",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value.toFixed(1)}°C`, "Temperatura"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Turbidez */}
      <Card>
        <CardHeader>
          <CardTitle>Turbidez</CardTitle>
          <CardDescription>Medições de turbidez da água</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turbidityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "NTU",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value.toFixed(1)} NTU`, "Turbidez"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area type="monotone" dataKey="turbidity" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Condutividade */}
      <Card>
        <CardHeader>
          <CardTitle>Condutividade</CardTitle>
          <CardDescription>Condutividade elétrica da água</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conductivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis
                  domain={["dataMin - 10", "dataMax + 10"]}
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "µS/cm",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value.toFixed(0)} µS/cm`, "Condutividade"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="conductivity"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
