"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Droplets, AlertTriangle, Maximize2 } from "lucide-react"

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

interface LeafletMapProps {
  sensors: Sensor[]
  reports: Report[]
}

export function LeafletMap({ sensors, reports }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Carregar Leaflet dinamicamente
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      try {
        // Carregar CSS do Leaflet
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Carregar JS do Leaflet
        const L = await import("leaflet")

        // Fix para os ícones do Leaflet
        delete (L as any).Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        if (mapRef.current && !mapInstanceRef.current) {
          // Inicializar o mapa centrado em São Paulo
          const map = L.map(mapRef.current).setView([-23.5505, -46.6333], 11)

          // Adicionar camada de tiles do OpenStreetMap
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map)

          mapInstanceRef.current = map

          // Adicionar marcadores para sensores
          sensors.forEach((sensor) => {
            if (sensor.latitude && sensor.longitude) {
              const statusColor =
                sensor.status === "active" ? "#10b981" : sensor.status === "maintenance" ? "#f59e0b" : "#ef4444"

              const icon = L.divIcon({
                html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg" style="background-color: ${statusColor}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>`,
                className: "custom-div-icon",
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })

              const marker = L.marker([sensor.latitude, sensor.longitude], { icon }).addTo(map)

              const statusText =
                sensor.status === "active" ? "Ativo" : sensor.status === "maintenance" ? "Em Manutenção" : "Inativo"

              marker.bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold text-sm">${sensor.name}</h3>
                  <p class="text-xs text-gray-600">${sensor.location}</p>
                  <p class="text-xs">Status: <span class="font-medium" style="color: ${statusColor}">${statusText}</span></p>
                  ${
                    sensor.last_reading
                      ? `<p class="text-xs">Última leitura: <span class="font-medium">${sensor.last_reading}m</span></p>`
                      : "<p class='text-xs'>Sem leituras recentes</p>"
                  }
                </div>
              `)

              marker.on("click", () => {
                setSelectedItem({ type: "sensor", data: sensor })
              })
            }
          })

          // Adicionar marcadores para relatos
          reports.forEach((report) => {
            if (report.latitude && report.longitude) {
              const statusColor =
                report.status === "closed" ? "#10b981" : report.status === "progress" ? "#f59e0b" : "#ef4444"

              const icon = L.divIcon({
                html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg" style="background-color: ${statusColor}">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>`,
                className: "custom-div-icon",
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })

              const marker = L.marker([report.latitude, report.longitude], { icon }).addTo(map)

              const statusText =
                report.status === "closed" ? "Resolvido" : report.status === "progress" ? "Em Andamento" : "Aberto"

              marker.bindPopup(`
                <div class="p-2">
                  <h3 class="font-bold text-sm">${report.title}</h3>
                  <p class="text-xs text-gray-600">${report.location}</p>
                  <p class="text-xs">Status: <span class="font-medium" style="color: ${statusColor}">${statusText}</span></p>
                  <p class="text-xs">Data: ${new Date(report.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              `)

              marker.on("click", () => {
                setSelectedItem({ type: "report", data: report })
              })
            }
          })

          setIsLoaded(true)
        }
      } catch (error) {
        console.error("Erro ao carregar Leaflet:", error)
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [sensors, reports])

  const sensorsWithCoords = sensors.filter((sensor) => sensor.latitude && sensor.longitude)
  const reportsWithCoords = reports.filter((report) => report.latitude && report.longitude)

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      <Card className={isFullscreen ? "h-full flex flex-col" : ""}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mapa Interativo</CardTitle>
            <CardDescription>
              {sensorsWithCoords.length} sensores e {reportsWithCoords.length} relatos no mapa
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Sair do modo tela cheia" : "Modo tela cheia"}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className={isFullscreen ? "flex-1 flex flex-col" : ""}>
          <div
            ref={mapRef}
            className={`rounded-lg border ${isFullscreen ? "flex-1" : "h-96"} ${
              !isLoaded ? "flex items-center justify-center bg-muted" : ""
            }`}
          >
            {!isLoaded && (
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Carregando mapa...</p>
                <p className="text-sm text-muted-foreground">Aguarde enquanto o mapa é inicializado</p>
              </div>
            )}
          </div>

          {/* Legenda */}
          {isLoaded && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                  Sensores ({sensorsWithCoords.length})
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Ativo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Manutenção</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Inativo</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Relatos ({reportsWithCoords.length})
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Aberto</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Em Andamento</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Resolvido</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      selectedItem.data.status === "active" || selectedItem.data.status === "closed"
                        ? "text-green-600"
                        : selectedItem.data.status === "maintenance" || selectedItem.data.status === "progress"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {selectedItem.type === "sensor"
                      ? selectedItem.data.status === "active"
                        ? "Ativo"
                        : selectedItem.data.status === "maintenance"
                          ? "Em Manutenção"
                          : "Inativo"
                      : selectedItem.data.status === "closed"
                        ? "Resolvido"
                        : selectedItem.data.status === "progress"
                          ? "Em Andamento"
                          : "Aberto"}
                  </span>
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
        </CardContent>
      </Card>
    </div>
  )
}
