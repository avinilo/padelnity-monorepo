import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ Configuración optimizada para apps móviles
// Esta configuración implementa las mejores prácticas para sesiones en aplicaciones móviles:
// - Sesiones persistentes por defecto (no necesita "recordarme")
// - Auto-refresh de tokens habilitado
// - PKCE flow para mayor seguridad
// - Detección automática de sesiones en URLs
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Mantiene la sesión activa automáticamente (comportamiento típico de apps móviles)
    autoRefreshToken: true,
    
    // Persiste la sesión en localStorage (indefinidamente hasta logout manual)
    persistSession: true,
    
    // Detecta automáticamente códigos de autenticación en URLs
    detectSessionInUrl: true,
    
    // PKCE flow - más seguro para apps móviles/SPA
    flowType: 'pkce'
  }
})

// Tipos generados automáticamente por Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
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

// Tipo de perfil simplificado para uso en la aplicación
export type Profile = Database['public']['Tables']['profiles']['Row'] 