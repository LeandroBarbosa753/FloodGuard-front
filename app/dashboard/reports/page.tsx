"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ReportDetailModal } from "@/components/dashboard/report-detail-modal"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })

      if (reportError) {
        console.error("Error fetching reports:", reportError)
        setFetchError(`Error fetching reports: ${reportError.message}`)
      } else {
        setReports(reportData || [])
      }
    } catch (error) {
      console.error("Exception in reports page:", error)
      setFetchError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportClick = (report) => {
    setSelectedReport(report)
    setModalOpen(true)
  }

  const getStatusText = (status) => {
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

  const renderReports = (filteredReports) => (
    <div className="space-y-4">
      {filteredReports.length === 0 ? (
        <div className="flex items-center justify-center h-24 rounded-md border">
          <p className="text-muted-foreground">Nenhum relato encontrado.</p>
        </div>
      ) : (
        filteredReports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleReportClick(report)}
          >
            <div className="flex-1">
              <h3 className="font-medium">{report.title}</h3>
              <p className="text-sm text-muted-foreground">{report.location || "Localização não especificada"}</p>
              <p className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString("pt-BR")}</p>
              {report.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
              )}
            </div>
            <div
              className={`text-sm font-medium ml-4 ${
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatos</h1>
          <p className="text-muted-foreground">Carregando relatos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatos</h1>
        <p className="text-muted-foreground">Relatos de alagamentos e problemas relacionados.</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Pesquisar relatos..." className="w-full pl-8" />
        </div>
      </div>

      {fetchError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="todos">
          <TabsList>
            <TabsTrigger value="todos">Todos ({reports.length})</TabsTrigger>
            <TabsTrigger value="aberto">Aberto ({reports.filter((r) => r.status === "open").length})</TabsTrigger>
            <TabsTrigger value="em-andamento">
              Em andamento ({reports.filter((r) => r.status === "progress").length})
            </TabsTrigger>
            <TabsTrigger value="fechado">Fechado ({reports.filter((r) => r.status === "closed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Relatos</CardTitle>
              </CardHeader>
              <CardContent>{renderReports(reports)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aberto">
            <Card>
              <CardHeader>
                <CardTitle>Relatos Abertos</CardTitle>
              </CardHeader>
              <CardContent>{renderReports(reports.filter((report) => report.status === "open"))}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="em-andamento">
            <Card>
              <CardHeader>
                <CardTitle>Relatos Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>{renderReports(reports.filter((report) => report.status === "progress"))}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fechado">
            <Card>
              <CardHeader>
                <CardTitle>Relatos Fechados</CardTitle>
              </CardHeader>
              <CardContent>{renderReports(reports.filter((report) => report.status === "closed"))}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de detalhes do relato */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open)
            if (!open) {
              setSelectedReport(null)
              fetchReports() // Recarregar relatos após fechar o modal
            }
          }}
        />
      )}
    </div>
  )
}
