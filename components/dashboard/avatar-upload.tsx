"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AvatarUploadProps {
  currentAvatar?: string
  userName: string
  onAvatarChange: (avatarUrl: string) => void
}

export function AvatarUpload({ currentAvatar, userName, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      })
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Criar preview local
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Simular upload (em produção, usar Supabase Storage, Cloudinary, etc.)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular URL do avatar uploadado
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=b6e3f4`

      onAvatarChange(avatarUrl)

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      })
    } catch (error) {
      console.error("Erro no upload:", error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem. Tente novamente.",
        variant: "destructive",
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={previewUrl || currentAvatar || "/placeholder.svg"} alt={userName} />
          <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">{userName}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={triggerFileSelect} disabled={isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Enviando..." : "Alterar Foto"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 5MB.</p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
