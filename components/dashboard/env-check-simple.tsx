"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function EnvCheckSimple() {
  // Verificar diretamente as variáveis
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se ambas estão definidas, não mostrar nada
  if (supabaseUrl && supabaseKey) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Configuração OK</AlertTitle>
        <AlertDescription className="text-green-700">Variáveis de ambiente configuradas corretamente.</AlertDescription>
      </Alert>
    )
  }

  const missingVars = []
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!supabaseKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

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
              Crie/edite o arquivo <code>.env.local</code> na raiz do projeto
            </li>
            <li>Adicione as variáveis:</li>
          </ol>
          <div className="bg-muted p-3 rounded-md mt-2">
            <code className="text-xs">
              NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
            </code>
          </div>
          <ol className="list-decimal pl-5 text-sm space-y-1" start={3}>
            <li>
              Reinicie o servidor: <code>npm run dev</code>
            </li>
            <li>Recarregue a página</li>
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  )
}
