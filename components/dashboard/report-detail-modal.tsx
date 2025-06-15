"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Report {
  id: number
  title: string
  location: string | null
  description: string | null
  image_url: string | null
  status: string
  created_at: string
  user_id: string | null
}

interface ReportDetailModalProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailModal({ report, open, onOpenChange }: ReportDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(report.status)
  const router = useRouter()

  const handleStatusUpdate = async () => {
    setIsUpdating(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", report.id)

      if (error) {
        throw error
      }

      toast({
        title: "Status atualizado",
        description: "O status do relato foi atualizado com sucesso!",
      })

      router.refresh()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "text-green-600 bg-green-100"
      case "progress":
        return "text-amber-600 bg-amber-100"
      case "open":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
          <DialogDescription>Relato criado em {new Date(report.created_at).toLocaleString("pt-BR")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status atual */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status atual:</span>
            <Badge className={getStatusColor(report.status)}>{getStatusText(report.status)}</Badge>
          </div>

          {/* Imagem se disponível */}
          {report.image_url && (
            <div>
              <h4 className="text-sm font-medium mb-2">Imagem:</h4>
              <img
                src={report.image_url || "/placeholder.svg"}
                alt="Imagem do relato"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Localização */}
          {report.location && (
            <div>
              <h4 className="text-sm font-medium mb-1">Localização:</h4>
              <p className="text-sm text-muted-foreground">{report.location}</p>
            </div>
          )}

          {/* Descrição */}
          {report.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Descrição:</h4>
              <p className="text-sm text-muted-foreground">{report.description}</p>
            </div>
          )}

          {/* Alterar status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Alterar Status:</h4>
            <div className="flex items-center space-x-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Não resolvido</SelectItem>
                  <SelectItem value="progress">Em andamento</SelectItem>
                  <SelectItem value="closed">Resolvido</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate} disabled={isUpdating || status === report.status} size="sm">
                {isUpdating ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ID do Relato:</span>
                <p className="text-muted-foreground">#{report.id}</p>
              </div>
              <div>
                <span className="font-medium">Data de Criação:</span>
                <p className="text-muted-foreground">{new Date(report.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
