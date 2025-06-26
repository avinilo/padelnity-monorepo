import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getOnboardingStatus } from '@/lib/onboarding'

interface OnboardingStatus {
  completed: boolean
  type: 'player' | 'business' | null
  loading: boolean
  error: string | null
}

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus>({
    completed: false,
    type: null,
    loading: true,
    error: null
  })

  const supabase = createClient()

  const checkOnboardingStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))
      
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setStatus({
          completed: false,
          type: null,
          loading: false,
          error: userError?.message || 'No hay usuario autenticado'
        })
        return
      }

      // Verificar el estado de onboarding
      const onboardingStatus = await getOnboardingStatus(user.id)
      
      setStatus({
        completed: onboardingStatus.completed,
        type: onboardingStatus.type as 'player' | 'business' | null,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setStatus({
        completed: false,
        type: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  const refreshStatus = async () => {
    await checkOnboardingStatus()
  }

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  // Suscribirse a cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkOnboardingStatus()
        } else if (event === 'SIGNED_OUT') {
          setStatus({
            completed: false,
            type: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    ...status,
    refreshStatus
  }
} 