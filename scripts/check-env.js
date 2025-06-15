// Script para verificar as variáveis de ambiente
console.log("=== Verificação das Variáveis de Ambiente ===")

// Verificar se as variáveis estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Definida" : "❌ Não definida")
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅ Definida" : "❌ Não definida")

if (supabaseUrl) {
  console.log("URL do Supabase:", supabaseUrl.substring(0, 30) + "...")
}

if (supabaseKey) {
  console.log("Chave do Supabase:", supabaseKey.substring(0, 20) + "...")
}

// Verificar se o arquivo .env.local existe
const fs = require("fs")
const path = require("path")

const envPath = path.join(process.cwd(), ".env.local")
const envExists = fs.existsSync(envPath)

console.log("\n=== Verificação do Arquivo .env.local ===")
console.log("Arquivo .env.local existe:", envExists ? "✅ Sim" : "❌ Não")

if (envExists) {
  try {
    const envContent = fs.readFileSync(envPath, "utf8")
    const lines = envContent.split("\n").filter((line) => line.trim() && !line.startsWith("#"))

    console.log("Variáveis encontradas no arquivo:")
    lines.forEach((line) => {
      const [key] = line.split("=")
      if (key) {
        console.log(`  - ${key.trim()}`)
      }
    })
  } catch (error) {
    console.error("Erro ao ler .env.local:", error.message)
  }
}

console.log("\n=== Instruções ===")
if (!envExists || !supabaseUrl || !supabaseKey) {
  console.log("Para corrigir:")
  console.log("1. Crie o arquivo .env.local na raiz do projeto")
  console.log("2. Adicione as seguintes linhas:")
  console.log("   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co")
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima")
  console.log("3. Reinicie o servidor: npm run dev")
} else {
  console.log("✅ Configuração parece estar correta!")
}
