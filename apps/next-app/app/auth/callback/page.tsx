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

      // Para otros casos (OAuth), verificar onboarding
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.user_metadata?.onboarding_complete) {
        redirect('/dashboard')
      } else {
        redirect('/onboarding/select-role')
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