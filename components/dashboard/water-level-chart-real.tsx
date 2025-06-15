"use client"

import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { WaterLevelDetailModal } from "./water-level-detail-modal"

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

interface Sensor {
  id: number
  name: string
  location: string
  status: string
}

interface WaterLevelChartRealProps {
  readings: Reading[]
  sensors: Sensor[]
}

export function WaterLevelChartReal({ readings, sensors }: WaterLevelChartRealProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return []

    return readings
      .slice(0, 20)
      .map((reading) => ({
        date: format(parseISO(reading.created_at), "dd/MM"),
        level: reading.water_level,
        fullDate: format(parseISO(reading.created_at), "dd/MM/yyyy"),
        sensor_id: reading.sensor_id,
      }))
      .reverse()
  }, [readings])

  // Calculate statistics for the table
  const tableData = useMemo(() => {
    if (!readings || readings.length === 0) return []

    // Group readings by date
    const groupedByDate = readings.reduce(
      (acc, reading) => {
        const date = format(parseISO(reading.created_at), "dd/MM/yyyy")
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(reading.water_level)
        return acc
      },
      {} as Record<string, number[]>,
    )

    // Calculate statistics for each date
    return Object.entries(groupedByDate)
      .map(([date, levels]) => {
        const sum = levels.reduce((a, b) => a + b, 0)
        const avg = sum / levels.length
        const min = Math.min(...levels)
        const max = Math.max(...levels)

        // Calculate standard deviation
        const variance = levels.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / levels.length
        const stdDev = Math.sqrt(variance)

        return {
          date,
          avg: avg.toFixed(1),
          min: min.toFixed(1),
          max: max.toFixed(1),
          stdDev: stdDev.toFixed(1),
          samples: levels.length,
        }
      })
      .sort((a, b) => {
        // Sort by date (assuming dd/MM/yyyy format)
        const [dayA, monthA, yearA] = a.date.split("/")
        const [dayB, monthB, yearB] = b.date.split("/")
        const dateA = new Date(+yearA, +monthA - 1, +dayA)
        const dateB = new Date(+yearB, +monthB - 1, +dayB)
        return dateB.getTime() - dateA.getTime() // Mais recente primeiro
      })
      .slice(0, 10) // Mostrar apenas os últimos 10 dias
  }, [readings])

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setModalOpen(true)
  }

  if (!readings || readings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-80 flex items-center justify-center border rounded-lg">
          <p className="text-muted-foreground">Nenhum dado de nível de água disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              label={{
                value: "Nível (m)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
              domain={[0, "auto"]}
            />
            <Tooltip
              formatter={(value, name, props) => {
                const sensor = sensors.find((s) => s.id === props.payload?.sensor_id)
                return [`${value} m`, `Nível de água${sensor ? ` - ${sensor.name}` : ""}`]
              }}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="level"
              name="Nível de água"
              stroke="#0ea5e9"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer">Data</TableHead>
              <TableHead>Nível médio (m)</TableHead>
              <TableHead>Mínimo (m)</TableHead>
              <TableHead>Máximo (m)</TableHead>
              <TableHead>Desvio padrão (m)</TableHead>
              <TableHead>Amostras</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow
                key={row.date}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleDateClick(row.date)}
                title="Clique para ver detalhes"
              >
                <TableCell className="font-medium text-primary hover:underline">{row.date}</TableCell>
                <TableCell>{row.avg}</TableCell>
                <TableCell>{row.min}</TableCell>
                <TableCell>{row.max}</TableCell>
                <TableCell>{row.stdDev}</TableCell>
                <TableCell>{row.samples}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de detalhes */}
      <WaterLevelDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDate || ""}
        readings={readings}
      />
    </div>
  )
}
