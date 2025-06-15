"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Sensor {
  id: number
  name: string
  device_id: string
  location: string | null
  latitude: number | null
  longitude: number | null
  status: string
}

interface EditSensorModalProps {
  sensor: Sensor
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSensorModal({ sensor, open, onOpenChange }: EditSensorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: sensor.name,
    device_id: sensor.device_id,
    location: sensor.location || "",
    latitude: sensor.latitude?.toString() || "",
    longitude: sensor.longitude?.toString() || "",
    status: sensor.status,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("sensors")
        .update({
          name: formData.name,
          device_id: formData.device_id,
          location: formData.location || null,
          latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sensor.id)

      if (error) {
        throw error
      }

      toast({
        title: "Sensor atualizado",
        description: "O sensor foi atualizado com sucesso!",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao atualizar sensor:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar sensor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Sensor</DialogTitle>
          <DialogDescription>Atualize as informações do sensor.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device_id" className="text-right">
                ID do Dispositivo
              </Label>
              <Input
                id="device_id"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Localização
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Rio Tietê - Ponte das Bandeiras"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitude" className="text-right">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="col-span-3"
                placeholder="-23.5505"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longitude" className="text-right">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="col-span-3"
                placeholder="-46.6333"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
