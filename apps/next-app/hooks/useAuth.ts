"use client";

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/auth-provider'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import type { AuthError } from '@supabase/supabase-js'

interface Profile {
  id: string
  role: 'player' | 'club' | null
  full_name: string | null
  avatar_url: string | null
  club_name: string | null
  website: string | null
  address: string | null
  onboarding_complete: boolean
}

export function useAuth() {
  const { supabase, session, user, loading: supabaseLoading } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const router = useRouter()

  const loading = supabaseLoading || authLoading || profileLoading

  // Cargar perfil cuando hay sesión
  useEffect(() => {
    if (session?.user) {
      loadProfile()
    } else {
      setProfile(null)
      setProfileLoading(false)
    }
  }, [session])

  const loadProfile = async () => {
    try {
      if (!session?.user) {
        setProfile(null)
        return
      }

      // TODO: Migrar a las nuevas tablas players/businesses cuando esté listo el esquema
      // Por ahora comentamos esta consulta para evitar errores
      /*
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error cargando perfil:', error)
        return
      }
      */

      // Usar metadata del usuario mientras migramos
      const userData = session.user.user_metadata || {}
      
      const profileData: Profile = {
        id: session.user.id,
        role: userData.role || null,
        full_name: userData.full_name || session.user.email?.split('@')[0] || '',
        avatar_url: userData.avatar_url || null,
        club_name: userData.club_name || null,
        website: userData.website || null,
        address: userData.address || null,
        onboarding_complete: userData.onboarding_complete || false,
      }

      setProfile(profileData)
    } catch (error) {
      console.error('Error cargando perfil:', error)
      setProfile(null)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error en registro:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error en inicio de sesión:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error en inicio de sesión con Google:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const signUpWithEmailVerification = async (email: string, password: string, fullName?: string) => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=email_verification`,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error en registro con email verification:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setAuthLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      router.push('/')
      setProfile(null)
      return { error: null }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      return { error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error al resetear contraseña:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  // Solo para recovery - TODO: Migrar a email verification
  const verifyOtp = async (email: string, token: string, type: 'recovery' = 'recovery') => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error verificando OTP para recovery:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    try {
      setAuthLoading(true)
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error al actualizar contraseña:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  const updateProfile = async (updates: {
    full_name?: string
    avatar_url?: string
    role?: 'player' | 'club'
    club_name?: string
    address?: string
    website?: string
    onboarding_complete?: boolean
  }) => {
    try {
      setAuthLoading(true)
      
      // Actualizar en auth.users metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: updates,
      })

      if (authError) throw authError

      // TODO: Migrar a las nuevas tablas players/businesses cuando esté listo el esquema
      // Por ahora comentamos esta actualización para evitar errores
      /*
      // También actualizar en la tabla profiles si existe
      if (session?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            ...updates,
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.warn('Error updating profile table:', profileError)
          // No lanzar error aquí ya que el auth update fue exitoso
        }
      }
      */

      // Recargar perfil
      await loadProfile()

      return { data: authData, error: null }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return { data: null, error: error as AuthError }
    } finally {
      setAuthLoading(false)
    }
  }

  return {
    user,
    profile,
    session,
    loading: loading,
    isAuthenticated: !!session,
    signUp,
    signUpWithEmailVerification,
    // Alias para compatibilidad temporal - TODO: Eliminar cuando se migre completamente
    signUpWithOtp: signUpWithEmailVerification,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    verifyOtp,
    updatePassword,
    updateProfile,
    loadProfile,
  }
} 