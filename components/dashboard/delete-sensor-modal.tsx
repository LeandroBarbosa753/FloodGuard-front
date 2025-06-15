"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface Sensor {
  id: number
  name: string
  device_id: string
  location: string | null
}

interface DeleteSensorModalProps {
  sensor: Sensor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteSensorModal({ sensor, open, onOpenChange }: DeleteSensorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Primeiro, deletar todas as leituras associadas
      const { error: readingsError } = await supabase.from("readings").delete().eq("sensor_id", sensor.id)

      if (readingsError) {
        console.warn("Erro ao deletar leituras:", readingsError)
        // Continuar mesmo se houver erro nas leituras
      }

      // Depois, deletar o sensor
      const { error: sensorError } = await supabase.from("sensors").delete().eq("id", sensor.id)

      if (sensorError) {
        throw sensorError
      }

      toast({
        title: "Sensor excluído",
        description: "O sensor e todas as suas leituras foram excluídos com sucesso!",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao excluir sensor:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir sensor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Excluir Sensor
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o sensor e todas as suas leituras.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium">Sensor a ser excluído:</h4>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Nome:</strong> {sensor.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>ID:</strong> {sensor.device_id}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Localização:</strong> {sensor.location || "Não especificada"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Excluindo..." : "Excluir Sensor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
