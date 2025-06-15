"use client"

import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Reading {
  id: number
  sensor_id: number
  water_level: number
  created_at: string
}

interface WaterLevelChartProps {
  data: Reading[]
}

export function WaterLevelChart({ data }: WaterLevelChartProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Process data for the chart
  const chartData = useMemo(() => {
    return data.map((reading) => ({
      date: format(parseISO(reading.created_at), "dd/MM"),
      level: reading.water_level,
    }))
  }, [data])

  // Calculate statistics for the table
  const tableData = useMemo(() => {
    // Group readings by date
    const groupedByDate = data.reduce(
      (acc, reading) => {
        const date = format(parseISO(reading.created_at), "dd/MM/yy")
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
        // Sort by date (assuming dd/MM/yy format)
        const [dayA, monthA, yearA] = a.date.split("/")
        const [dayB, monthB, yearB] = b.date.split("/")
        const dateA = new Date(+`20${yearA}`, +monthA - 1, +dayA)
        const dateB = new Date(+`20${yearB}`, +monthB - 1, +dayB)
        return dateA.getTime() - dateB.getTime()
      })
  }, [data])

  return (
    <div className="space-y-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={(e) => {
              if (e.activeLabel) {
                setSelectedDate(e.activeLabel)
              }
            }}
          >
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
              formatter={(value) => [`${value} m`, "Nível de água"]}
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
              <TableHead>Data</TableHead>
              <TableHead>Nível médio (m)</TableHead>
              <TableHead>Mínimo (m)</TableHead>
              <TableHead>Máximo (m)</TableHead>
              <TableHead>Desvio padrão (m)</TableHead>
              <TableHead>Amostras</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.date}>
                <TableCell>{row.date}</TableCell>
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
    </div>
  )
}
