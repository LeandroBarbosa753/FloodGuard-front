import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FloodGuard - Sistema de Monitoramento de Enchentes",
  description: "Sistema inteligente para monitoramento e prevenção de enchentes urbanas",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  )
}
