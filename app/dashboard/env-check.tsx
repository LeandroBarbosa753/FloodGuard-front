"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([])

  useEffect(() => {
    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missing = requiredVars.filter((varName) => !process.env[varName] && !window[varName as keyof typeof window])

    if (missing.length > 0) {
      setMissingVars(missing)
    }
  }, [])

  if (missingVars.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuração Incompleta</AlertTitle>
      <AlertDescription>
        <p>As seguintes variáveis de ambiente estão faltando:</p>
        <ul className="list-disc pl-5 mt-2">
          {missingVars.map((varName) => (
            <li key={varName}>{varName}</li>
          ))}
        </ul>
        <p className="mt-2">Verifique se o arquivo .env.local está configurado corretamente.</p>
      </AlertDescription>
    </Alert>
  )
}
