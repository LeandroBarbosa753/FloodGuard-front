"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle, Settings } from "lucide-react"
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

export default function NotificationsPage() {
  const { user } = useSupabase()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      setNotifications(data || [])
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
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

      if (error) {
        throw error
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      toast({
        title: "Notificação excluída",
        description: "A notificação foi excluída com sucesso.",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir notificação.",
        variant: "destructive",
      })
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
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string, category: string) => {
    if (category === "alert") {
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    }
    if (category === "maintenance") {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }

    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "alerts") return notification.category === "alert"
    if (filter === "maintenance") return notification.category === "maintenance"
    if (filter === "reports") return notification.category === "report"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e alertas do sistema. {unreadCount} não lidas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard/settings?tab=notifications")}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Não lidas ({unreadCount})</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas ({notifications.filter((n) => n.category === "alert").length})
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Manutenção ({notifications.filter((n) => n.category === "maintenance").length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Relatórios ({notifications.filter((n) => n.category === "report").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Carregando notificações...</div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                  <p className="text-muted-foreground">
                    {filter === "unread"
                      ? "Todas as notificações foram lidas."
                      : "Você não tem notificações nesta categoria."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all ${!notification.read ? "border-blue-200 bg-blue-50/30" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Nova
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.category === "alert" && "Alerta"}
                            {notification.category === "maintenance" && "Manutenção"}
                            {notification.category === "report" && "Relatório"}
                            {notification.category === "system" && "Sistema"}
                          </Badge>
                          <div className="flex gap-1 ml-auto">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                title="Marcar como lida"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              title="Excluir notificação"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
