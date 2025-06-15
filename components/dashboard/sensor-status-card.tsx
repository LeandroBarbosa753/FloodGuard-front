import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server } from "lucide-react"

interface SensorStatusCardProps {
  title: string
  value: number
  status: "active" | "inactive"
}

export function SensorStatusCard({ title, value, status }: SensorStatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Server className={`h-4 w-4 ${status === "active" ? "text-green-500" : "text-gray-500"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {status === "active" ? "Sensores funcionando normalmente" : "Sensores que precisam de atenção"}
        </p>
      </CardContent>
    </Card>
  )
}
