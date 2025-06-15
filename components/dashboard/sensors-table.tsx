"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface Sensor {
  id: number
  name: string
  location: string
  status: string
  last_reading: number | null
  updated_at: string
}

interface SensorsTableProps {
  sensors: Sensor[]
}

export function SensorsTable({ sensors }: SensorsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSensors = sensors.filter(
    (sensor) =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Leitura</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSensors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum sensor encontrado.
              </TableCell>
            </TableRow>
          ) : (
            filteredSensors.map((sensor) => (
              <TableRow key={sensor.id}>
                <TableCell className="font-medium">{sensor.name}</TableCell>
                <TableCell>{sensor.location}</TableCell>
                <TableCell>
                  <Badge
                    variant={sensor.status === "active" ? "default" : "secondary"}
                    className={
                      sensor.status === "active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {sensor.status === "active" ? "Ativo" : "Desativado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sensor.last_reading !== null
                    ? `${sensor.last_reading}m - ${format(parseISO(sensor.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}`
                    : "Sem leituras"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon">
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
    </div>
  )
}
