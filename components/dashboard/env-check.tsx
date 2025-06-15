"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Aguardar um pouco para garantir que as variáveis estejam disponíveis
    const checkEnvVars = () => {
      const requiredVars = [
        {
          name: "NEXT_PUBLIC_SUPABASE_URL",
          value: process.env.NEXT_PUBLIC_SUPABASE_URL || window?.ENV?.NEXT_PUBLIC_SUPABASE_URL,
        },
        {
          name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || window?.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      ]

      // Verificar se as variáveis estão definidas
      const missing = requiredVars.filter((varObj) => !varObj.value).map((varObj) => varObj.name)

      // Verificar também se conseguimos criar um cliente Supabase
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          // Se não conseguir acessar via process.env, tentar via window
          const urlFromWindow = typeof window !== "undefined" && (window as any).ENV?.NEXT_PUBLIC_SUPABASE_URL
          const keyFromWindow = typeof window !== "undefined" && (window as any).ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY

          if (!urlFromWindow || !keyFromWindow) {
            console.log("Environment variables not found in process.env or window.ENV")
          }
        }
      } catch (error) {
        console.error("Error checking environment variables:", error)
      }

      setMissingVars(missing)
      setIsChecking(false)
    }

    // Aguardar um pouco antes de verificar
    const timer = setTimeout(checkEnvVars, 100)

    return () => clearTimeout(timer)
  }, [])

  // Não mostrar nada enquanto está verificando
  if (isChecking) {
    return null
  }

  // Se não há variáveis faltando, não mostrar o alerta
  if (missingVars.length === 0) {
    return null
  }

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
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">Para corrigir:</p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>
              Verifique se o arquivo <code>.env.local</code> existe na raiz do projeto
            </li>
            <li>Certifique-se de que as variáveis estão definidas corretamente:</li>
          </ol>
          <div className="bg-muted p-3 rounded-md mt-2">
            <code className="text-xs">
              NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
            </code>
          </div>
          <ol className="list-decimal pl-5 text-sm space-y-1" start={3}>
            <li>
              Reinicie o servidor de desenvolvimento (<code>npm run dev</code>)
            </li>
            <li>Limpe o cache do navegador</li>
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  )
}
