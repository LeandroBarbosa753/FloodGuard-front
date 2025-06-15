"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Check, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/providers/supabase-provider"
import { toast } from "@/components/ui/use-toast"

interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  category: string
  read: boolean
  action_url?: string
  created_at: string
}

export function NotificationsDropdown() {
  const { user } = useSupabase()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (error) {
      console.error("Exception fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)

      if (error) {
        throw error
      }

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("read", false)

      if (error) {
        throw error
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Erro",
        description: "Erro ao marcar notificações como lidas.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === "alert") {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
    if (category === "maintenance") {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }

    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type, notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = "/dashboard/notifications")}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
