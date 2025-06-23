"use client"

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from './useToast'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!error) {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => setLoading(false), 2000)

    getInitialSession().finally(() => clearTimeout(timeoutId))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          router.push('/register')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [router])

  const signUpWithOtp = async (email: string, password: string, fullName?: string) => {
    try {
      // Verificar si el usuario ya existe
      const { error: testError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }
      })
      
      if (!testError) {
        // Solo devolver error, el componente se encarga del toast
        return { data: null, error: new Error('User already exists') }
      }
      
      // Crear usuario nuevo
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName || '',
            display_name: fullName || '',
            signup_password: password
          }
        }
      })
      
      if (error) {
        // Solo mostrar toasts para errores específicos del sistema, no de UI
        if (error.message?.includes('rate_limit') || error.code === 'over_email_send_rate_limit') {
          const timeMatch = error.message?.match(/(\d+) seconds/)
          const waitTime = timeMatch ? timeMatch[1] : '60'
          toast.error("Límite de seguridad", `Espera ${waitTime} segundos antes de intentar de nuevo`)
        } else if (error.message?.includes('Signups not allowed for otp')) {
          toast.error("Configuración requerida", "El registro por OTP está deshabilitado en la configuración de Supabase")
        } else if (error.status === 422) {
          toast.error("Error de configuración", "Problema con el template de email en Supabase")
        }
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const isProduction = window.location.hostname !== 'localhost'
      const redirectUrl = isProduction 
        ? 'https://padelnity.vercel.app/auth/callback'
        : `${window.location.origin}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { data: null, error }
    } catch (error) {
      console.error('Signout error:', error)
      return { data: null, error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          data: { type: 'password_reset' }
        }
      })

      if (error) {
        return { data: null, error }
      }

      return { data: { message: 'OTP sent' }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const verifyOtp = async (email: string, token: string, typeOrPassword?: string) => {
    try {
      const isRecovery = typeOrPassword === 'recovery'
      const type = isRecovery ? 'recovery' : 'email'
      const registrationPassword = isRecovery ? undefined : typeOrPassword
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type as any
      })

      if (error) {
        if (error.message?.includes('Email link is invalid or has expired') || 
            error.message?.includes('Token has expired')) {
          toast.error("Código expirado", "El código ha expirado. Solicita uno nuevo.")
        } else if (error.message?.includes('Invalid token')) {
          toast.error("Código incorrecto", "Verifica el código e inténtalo de nuevo.")
        } else {
          toast.error("Código inválido", error.message)
        }
        return { data: null, error }
      }

      if (data.user) {
        // Actualizar contraseña si es registro
        if (registrationPassword && data.user.user_metadata?.signup_password && !isRecovery) {
          try {
            await supabase.auth.updateUser({ password: registrationPassword })
          } catch (passwordUpdateError) {
            console.warn('Password update error:', passwordUpdateError)
          }
        }

        const message = isRecovery 
          ? "Código verificado. Ahora puedes cambiar tu contraseña"
          : "Bienvenido. Tu cuenta ha sido verificada exitosamente"
        
        toast.success(isRecovery ? "Código verificado" : "Bienvenido", message)
        return { data, error: null }
      }

      return { data: null, error: { message: 'No user found' } }
    } catch (error) {
      console.error('Error en verifyOtp:', error)
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword: string, retryCount = 0) => {
    const maxRetries = 3
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Sesión expirada", "Por favor, solicita un nuevo código")
        return { data: null, error: { message: 'No active session' } }
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        if (error.message?.includes('Failed to fetch') && retryCount < maxRetries) {
          toast.error("Error de conexión", `Reintentando... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return updatePassword(newPassword, retryCount + 1)
        } else if (error.message?.includes('Password should be at least')) {
          toast.error("Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres")
        } else if (error.message?.includes('session')) {
          toast.error("Sesión expirada", "Por favor, solicita un nuevo código")
        } else {
          toast.error("Error al cambiar contraseña", error.message)
        }
        
        return { data: null, error }
      }

      return { data: { message: 'Password updated', user: data.user }, error: null }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message?.includes('Failed to fetch') && retryCount < maxRetries) {
        toast.error("Error de red", `Reintentando... (${retryCount + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)))
        return updatePassword(newPassword, retryCount + 1)
      } else {
        toast.error("Error inesperado", "Inténtalo de nuevo más tarde")
      }
      
      return { data: null, error }
    }
  }

  return {
    user,
    session,
    loading,
    signUpWithOtp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    verifyOtp,
    updatePassword
  }
} 