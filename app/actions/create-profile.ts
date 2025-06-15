"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createUserProfile(userId: string, name: string, avatarUrl?: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Verificar se o perfil já existe
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking profile:", checkError)
    }

    if (existingProfile) {
      // Perfil já existe, não precisa criar
      return { success: true, message: "Profile already exists" }
    }

    // Criar perfil com retry
    let retryCount = 0
    let error = null

    while (retryCount < 3) {
      try {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })

        if (!insertError) {
          // Sucesso! Revalidar o caminho do dashboard
          revalidatePath("/dashboard")
          return { success: true, message: "Profile created successfully" }
        }

        error = insertError
        console.error(`Profile creation attempt ${retryCount + 1} failed:`, insertError)

        // Esperar antes de tentar novamente
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
        retryCount++
      } catch (e) {
        error = e
        console.error(`Profile creation exception on attempt ${retryCount + 1}:`, e)
        retryCount++
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
      }
    }

    return {
      success: false,
      error: error ? (error instanceof Error ? error.message : String(error)) : "Failed after multiple attempts",
    }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating profile",
    }
  }
}
