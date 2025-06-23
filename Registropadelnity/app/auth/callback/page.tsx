"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { useToast } from '@/hooks/useToast'

export default function AuthCallback() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        const error = urlParams.get('error') || hashParams.get('error')
        if (error) {
          toast.error("Autenticación cancelada", "No se pudo completar el inicio de sesión con Google")
          router.push('/login')
          return
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          toast.error("Error de sesión", "No se pudo establecer la sesión")
          router.push('/login')
          return
        }

        if (data.session?.user) {
          const user = data.session.user
          const name = user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'Usuario'
          
          toast.success("¡Bienvenido!", `Hola ${name}, estás conectado`)
          
          setTimeout(() => {
            router.push('/dashboard')
          }, 800)
        } else {
          toast.info("Sesión pendiente", "Redirigiendo...")
          router.push('/login')
        }
      } catch (error) {
        toast.error("Error inesperado", "Algo salió mal durante la autenticación")
        router.push('/login')
      }
    }

    const timer = setTimeout(handleAuthCallback, 300)
    return () => clearTimeout(timer)
  }, [router, toast])

  return (
    <LoadingScreen 
      isVisible={true}
      message="Completando autenticación con Google..."
      variant="fullscreen"
    />
  )
} 