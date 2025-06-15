"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export function AlertForm() {
  const [location, setLocation] = useState("")
  const [message, setMessage] = useState("")
  const [currentLevel, setCurrentLevel] = useState([1])
  const [forecastLevel, setForecastLevel] = useState([1])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!location || !message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Alerta configurado",
      description: "Seu alerta foi configurado com sucesso.",
    })

    // Reset form
    setLocation("")
    setMessage("")
    setCurrentLevel([1])
    setForecastLevel([1])
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              placeholder="Ex: Rio de Janeiro"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem de alerta</Label>
            <Input
              id="message"
              placeholder="Ex: Nível de água crítico"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Alertar quando o nível de água atingir:</Label>
              <div className="pt-6">
                <div className="flex justify-between mb-2">
                  <span>Altura da água</span>
                  <span>{currentLevel[0]}m</span>
                </div>
                <Slider
                  defaultValue={[1]}
                  max={5}
                  min={0.1}
                  step={0.1}
                  value={currentLevel}
                  onValueChange={setCurrentLevel}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0.1m</span>
                  <span>5m</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Alertar quando a previsão do nível de água atingir:</Label>
              <div className="pt-6">
                <div className="flex justify-between mb-2">
                  <span>Altura da água</span>
                  <span>{forecastLevel[0]}m</span>
                </div>
                <Slider
                  defaultValue={[1]}
                  max={5}
                  min={0.1}
                  step={0.1}
                  value={forecastLevel}
                  onValueChange={setForecastLevel}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0.1m</span>
                  <span>5m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
