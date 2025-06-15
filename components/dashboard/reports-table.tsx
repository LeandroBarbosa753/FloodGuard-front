"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Report {
  id: number
  title: string
  location: string
  status: string
  created_at: string
}

interface ReportsTableProps {
  reports: Report[]
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Não resolvido"
      case "progress":
        return "Em andamento"
      case "closed":
        return "Resolvido"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="flex items-center justify-center h-24 rounded-md border">
          <p className="text-muted-foreground">Nenhum relato encontrado.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 rounded-md border">
            <div>
              <h3 className="font-medium">{report.title}</h3>
              <p className="text-sm text-muted-foreground">{report.location}</p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(report.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div
              className={`text-sm font-medium ${
                report.status === "closed"
                  ? "text-green-600"
                  : report.status === "progress"
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {getStatusText(report.status)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
