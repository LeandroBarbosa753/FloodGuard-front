"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, MapPin, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GeocodingService } from "@/lib/geocoding-service"

export function AddSensorModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    device_id: "",
    location: "",
    latitude: "",
    longitude: "",
  })
  const router = useRouter()

  const handleLocationChange = async (location: string) => {
    setFormData({ ...formData, location })

    if (location.trim().length > 3) {
      setIsGeocoding(true)
      try {
        const result = await GeocodingService.geocodeAddress(location)
        if (result) {
          setFormData((prev) => ({
            ...prev,
            latitude: result.latitude.toString(),
            longitude: result.longitude.toString(),
          }))
          toast({
            title: "Localização encontrada",
            description: `Coordenadas atualizadas automaticamente: ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`,
          })
        }
      } catch (error) {
        console.error("Erro na geocodificação:", error)
      } finally {
        setIsGeocoding(false)
      }
    }
  }

  const getCurrentLocation = async () => {
    setIsGeocoding(true)
    try {
      const result = await GeocodingService.getCurrentLocation()
      if (result) {
        setFormData((prev) => ({
          ...prev,
          location: result.formatted_address,
          latitude: result.latitude.toString(),
          longitude: result.longitude.toString(),
        }))
        toast({
          title: "Localização atual obtida",
          description: "Coordenadas atualizadas com sua localização atual.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível obter sua localização atual.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao obter localização atual.",
        variant: "destructive",
      })
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { error } = await supabase.from("sensors").insert({
        user_id: user.id,
        name: formData.name,
        device_id: formData.device_id,
        location: formData.location,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
        status: "active",
      })

      if (error) {
        throw error
      }

      toast({
        title: "Sensor adicionado",
        description: "O sensor foi adicionado com sucesso!",
      })

      setFormData({
        name: "",
        device_id: "",
        location: "",
        latitude: "",
        longitude: "",
      })
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao adicionar sensor:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar sensor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Sensor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Sensor</DialogTitle>
          <DialogDescription>Preencha as informações do sensor que deseja adicionar.</DialogDescription>
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
                placeholder="Ex: Sensor Rio Tietê"
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
                placeholder="Ex: SENSOR_001"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Localização
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="Ex: Rio Tietê - Ponte das Bandeiras"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getCurrentLocation}
                    disabled={isGeocoding}
                    title="Usar localização atual"
                  >
                    {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  </Button>
                </div>
                {isGeocoding && <p className="text-xs text-muted-foreground">Buscando coordenadas...</p>}
              </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar Sensor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
