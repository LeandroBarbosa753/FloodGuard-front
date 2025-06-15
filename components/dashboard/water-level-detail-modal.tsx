"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, MapPin, Clock, TrendingUp, TrendingDown } from "lucide-react"

interface Reading {
  id: number
  sensor_id: number
  water_level: number
  created_at: string
  sensors?: {
    name: string
    location: string
    status: string
  }
}

interface WaterLevelDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  readings: Reading[]
}

export function WaterLevelDetailModal({ open, onOpenChange, date, readings }: WaterLevelDetailModalProps) {
  // Filtrar leituras para a data selecionada
  const dayReadings = readings.filter((reading) => {
    const readingDate = new Date(reading.created_at).toLocaleDateString("pt-BR")
    return readingDate === date
  })

  // Calcular estatísticas do dia
  const levels = dayReadings.map((r) => r.water_level)
  const avgLevel = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : 0
  const minLevel = levels.length > 0 ? Math.min(...levels) : 0
  const maxLevel = levels.length > 0 ? Math.max(...levels) : 0
  const variation = maxLevel - minLevel

  // Agrupar por sensor
  const sensorGroups = dayReadings.reduce(
    (acc, reading) => {
      const sensorId = reading.sensor_id
      if (!acc[sensorId]) {
        acc[sensorId] = {
          sensor: reading.sensors || {
            name: `Sensor ${sensorId}`,
            location: "Localização não informada",
            status: "unknown",
          },
          readings: [],
        }
      }
      acc[sensorId].readings.push(reading)
      return acc
    },
    {} as Record<number, { sensor: any; readings: Reading[] }>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Detalhes do Dia {date}
          </DialogTitle>
          <DialogDescription>Informações detalhadas das leituras de nível de água para este dia</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas do dia */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Leituras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayReadings.length}</div>
                <p className="text-xs text-muted-foreground">Total do dia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Nível Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgLevel.toFixed(2)}m</div>
                <p className="text-xs text-muted-foreground">Média do dia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Variação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{variation.toFixed(2)}m</div>
                <p className="text-xs text-muted-foreground">
                  {minLevel.toFixed(2)}m - {maxLevel.toFixed(2)}m
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sensores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(sensorGroups).length}</div>
                <p className="text-xs text-muted-foreground">Ativos no dia</p>
              </CardContent>
            </Card>
          </div>

          {/* Leituras por sensor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leituras por Sensor</h3>
            {Object.entries(sensorGroups).map(([sensorId, group]) => {
              const sensorLevels = group.readings.map((r) => r.water_level)
              const sensorAvg = sensorLevels.reduce((a, b) => a + b, 0) / sensorLevels.length
              const sensorMin = Math.min(...sensorLevels)
              const sensorMax = Math.max(...sensorLevels)

              return (
                <Card key={sensorId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{group.sensor.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {group.sensor.location}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={group.sensor.status === "active" ? "default" : "secondary"}
                        className={
                          group.sensor.status === "active"
                            ? "bg-green-100 text-green-800"
                            : group.sensor.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {group.sensor.status === "active"
                          ? "Ativo"
                          : group.sensor.status === "maintenance"
                            ? "Manutenção"
                            : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{sensorAvg.toFixed(2)}m</div>
                        <div className="text-xs text-muted-foreground">Média</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                          {sensorMin.toFixed(2)}m
                        </div>
                        <div className="text-xs text-muted-foreground">Mínimo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          {sensorMax.toFixed(2)}m
                        </div>
                        <div className="text-xs text-muted-foreground">Máximo</div>
                      </div>
                    </div>

                    {/* Lista de leituras */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Leituras do Dia ({group.readings.length})</h4>
                      <div className="grid gap-2 max-h-32 overflow-y-auto">
                        {group.readings
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map((reading) => (
                            <div
                              key={reading.id}
                              className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {new Date(reading.created_at).toLocaleTimeString("pt-BR")}
                              </div>
                              <div className="font-medium">{reading.water_level.toFixed(2)}m</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {dayReadings.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma leitura encontrada</h3>
                  <p className="text-muted-foreground">
                    Não há leituras de nível de água registradas para o dia {date}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
