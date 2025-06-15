export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          id: number
          user_id: string
          name: string
          device_id: string
          status: string
          location: string | null
          latitude: number | null
          longitude: number | null
          last_reading: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          device_id: string
          status?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          last_reading?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          device_id?: string
          status?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          last_reading?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      readings: {
        Row: {
          id: number
          sensor_id: number
          water_level: number
          created_at: string
        }
        Insert: {
          id?: number
          sensor_id: number
          water_level: number
          created_at?: string
        }
        Update: {
          id?: number
          sensor_id?: number
          water_level?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "readings_sensor_id_fkey"
            columns: ["sensor_id"]
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          id: number
          user_id: string | null
          title: string
          location: string | null
          description: string | null
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          title: string
          location?: string | null
          description?: string | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          title?: string
          location?: string | null
          description?: string | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
