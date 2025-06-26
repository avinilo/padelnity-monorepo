import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; type?: string }>
}) {
  const { code, error, type } = await searchParams

  if (error) {
    console.log('Error en callback:', error)
    redirect('/login?error=auth_error')
  }

  // Si hay un código, intentamos intercambiarlo por una sesión
  if (code) {
    const supabase = await createClient()

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.log('Error en intercambio:', exchangeError.message)
        redirect('/login?error=session_error')
      }

      // Verificación de email exitosa - redirigir a página de confirmación
      if (type === 'email_verification' || type === 'signup') {
        redirect('/auth/email-verified')
      }

      // Para otros casos (OAuth), verificar onboarding en la base de datos
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Verificar estado de onboarding en las tablas de la base de datos
        const onboardingStatus = await checkOnboardingStatus(supabase, user.id)
        
        if (onboardingStatus.completed) {
          redirect('/dashboard')
        } else {
          redirect('/onboarding/select-role')
        }
      } else {
        redirect('/login?error=no_user')
      }
    } catch (error: any) {
      // Si es error de redirección de Next.js, lo re-lanzamos
      if (error?.digest?.includes('NEXT_REDIRECT')) {
        throw error
      }

      console.log('Error inesperado:', error?.message || 'Unknown error')
      redirect('/login?error=callback_failed')
    }
  }

  // Sin código, verificar si es un enlace directo de verificación
  if (type === 'signup' || type === 'email_verification') {
    redirect('/auth/email-verified')
  }

  // Fallback - redirigir al login
  redirect('/login')
}

// Función para verificar el estado del onboarding (misma lógica que el middleware)
async function checkOnboardingStatus(supabase: any, userId: string) {
  try {
    // Verificar si el usuario tiene un perfil de jugador
    const { data: playerProfile } = await supabase
      .from('players')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle()

    if (playerProfile?.onboarding_complete) {
      return { completed: true, type: 'player' }
    }

    // Verificar si el usuario tiene un perfil de negocio en cualquiera de las tablas
    const businessTables = ['clubs', 'tiendas', 'academias', 'instalaciones']
    
    for (const table of businessTables) {
      const { data: businessProfile } = await supabase
        .from(table)
        .select('onboarding_complete')
        .eq('user_id', userId)
        .maybeSingle()

      // Para clubs y tiendas verificar onboarding_complete
      // Para academias e instalaciones, solo verificar que exista el registro
      const isCompleted = (table === 'clubs' || table === 'tiendas') 
        ? businessProfile?.onboarding_complete 
        : !!businessProfile

      if (isCompleted) {
        return { completed: true, type: 'business' }
      }
    }

    return { completed: false, type: null }
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return { completed: false, type: null }
  }
} 