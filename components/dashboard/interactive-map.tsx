"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Droplets, AlertTriangle } from "lucide-react"

interface Sensor {
  id: number
  name: string
  location: string
  latitude: number | null
  longitude: number | null
  status: string
  last_reading: number | null
}

interface Report {
  id: number
  title: string
  location: string | null
  latitude: number | null
  longitude: number | null
  status: string
  created_at: string
}

interface InteractiveMapProps {
  sensors: Sensor[]
  reports: Report[]
}

export function InteractiveMap({ sensors, reports }: InteractiveMapProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Filtrar apenas sensores e relatos com coordenadas
  const sensorsWithCoords = sensors.filter((sensor) => sensor.latitude && sensor.longitude)
  const reportsWithCoords = reports.filter((report) => report.latitude && report.longitude)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa Interativo</CardTitle>
        <CardDescription>
          Visualize a localização dos sensores e relatos. {sensorsWithCoords.length} sensores e{" "}
          {reportsWithCoords.length} relatos com coordenadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Placeholder para o mapa - aqui você pode integrar com Google Maps, Leaflet, etc. */}
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Mapa Interativo</p>
              <p className="text-sm text-muted-foreground">Integração com mapa será implementada aqui</p>
            </div>
          </div>

          {/* Lista de itens no mapa */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                Sensores ({sensorsWithCoords.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sensorsWithCoords.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedItem({ type: "sensor", data: sensor })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sensor.name}</p>
                        <p className="text-sm text-muted-foreground">{sensor.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {sensor.latitude?.toFixed(4)}, {sensor.longitude?.toFixed(4)}
                        </p>
                      </div>
                      <Badge
                        variant={sensor.status === "active" ? "default" : "secondary"}
                        className={
                          sensor.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {sensor.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Relatos ({reportsWithCoords.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reportsWithCoords.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedItem({ type: "report", data: report })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">{report.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          report.status === "closed"
                            ? "text-green-600 border-green-600"
                            : report.status === "progress"
                              ? "text-amber-600 border-amber-600"
                              : "text-red-600 border-red-600"
                        }
                      >
                        {report.status === "closed"
                          ? "Resolvido"
                          : report.status === "progress"
                            ? "Em andamento"
                            : "Aberto"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalhes do item selecionado */}
          {selectedItem && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">
                {selectedItem.type === "sensor" ? "Sensor Selecionado" : "Relato Selecionado"}
              </h4>
              <div className="grid gap-2 text-sm">
                <p>
                  <strong>Nome:</strong>{" "}
                  {selectedItem.type === "sensor" ? selectedItem.data.name : selectedItem.data.title}
                </p>
                <p>
                  <strong>Localização:</strong> {selectedItem.data.location}
                </p>
                <p>
                  <strong>Coordenadas:</strong> {selectedItem.data.latitude?.toFixed(4)},{" "}
                  {selectedItem.data.longitude?.toFixed(4)}
                </p>
                {selectedItem.type === "sensor" && (
                  <p>
                    <strong>Última Leitura:</strong>{" "}
                    {selectedItem.data.last_reading ? `${selectedItem.data.last_reading}m` : "Sem dados"}
                  </p>
                )}
                {selectedItem.type === "report" && (
                  <p>
                    <strong>Data:</strong> {new Date(selectedItem.data.created_at).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
