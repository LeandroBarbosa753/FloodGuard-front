"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AddSensorModal } from "@/components/dashboard/add-sensor-modal"
import { EditSensorModal } from "@/components/dashboard/edit-sensor-modal"
import { DeleteSensorModal } from "@/components/dashboard/delete-sensor-modal"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function SensorsPage() {
  const [sensors, setSensors] = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingSensor, setEditingSensor] = useState(null)
  const [deletingSensor, setDeletingSensor] = useState(null)

  useEffect(() => {
    fetchSensors()
  }, [])

  const fetchSensors = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: sensorData, error: sensorError } = await supabase
        .from("sensors")
        .select("*")
        .order("name", { ascending: true })

      if (sensorError) {
        console.error("Error fetching sensors:", sensorError)
        setFetchError(`Error fetching sensors: ${sensorError.message}`)
      } else {
        setSensors(sensorData || [])
      }
    } catch (error) {
      console.error("Exception in sensors page:", error)
      setFetchError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSensors = sensors.filter(
    (sensor) =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.device_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inativo</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Manutenção</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Meus Sensores</h1>
          <AddSensorModal />
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando sensores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Sensores</h1>
          <p className="text-muted-foreground">Gerencie seus sensores de monitoramento de água.</p>
        </div>
        <AddSensorModal />
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar sensores..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {fetchError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {fetchError}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={fetchSensors}>
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Sensores ({filteredSensors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID do Dispositivo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Leitura</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSensors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm
                        ? "Nenhum sensor encontrado com os critérios de busca."
                        : "Nenhum sensor encontrado. Adicione seu primeiro sensor clicando no botão 'Adicionar Sensor'."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell className="font-medium">{sensor.name}</TableCell>
                      <TableCell className="font-mono text-sm">{sensor.device_id}</TableCell>
                      <TableCell>{sensor.location || "Não especificado"}</TableCell>
                      <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                      <TableCell>
                        {sensor.last_reading !== null
                          ? `${sensor.last_reading}m - ${new Date(sensor.updated_at).toLocaleString("pt-BR")}`
                          : "Sem leituras"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingSensor(sensor)}
                            title="Editar sensor"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingSensor(sensor)}
                            title="Excluir sensor"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      {editingSensor && (
        <EditSensorModal
          sensor={editingSensor}
          open={!!editingSensor}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSensor(null)
              fetchSensors()
            }
          }}
        />
      )}

      {deletingSensor && (
        <DeleteSensorModal
          sensor={deletingSensor}
          open={!!deletingSensor}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingSensor(null)
              fetchSensors()
            }
          }}
        />
      )}
    </div>
  )
}
