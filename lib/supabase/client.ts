import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Variável global para armazenar a instância singleton
let supabaseClientSingleton: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Para SSR, sempre cria um novo cliente
    return createClientComponentClient<Database>()
  }

  // Para client-side, usa o padrão singleton
  if (!supabaseClientSingleton) {
    supabaseClientSingleton = createClientComponentClient<Database>({
      options: {
        global: {
          // Usar um identificador único para evitar conflitos
          headers: { "x-client-info": "floodguard-client" },
        },
      },
    })
  }

  return supabaseClientSingleton
}
