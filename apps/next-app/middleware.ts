import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Verificar que las variables de entorno estén disponibles
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    return NextResponse.next()
  }

  try {
    // Usar createClient directo para Edge Runtime (más compatible)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Obtener token de las cookies manualmente
    const token = req.cookies.get('sb-access-token')?.value || 
                  req.cookies.get('supabase-auth-token')?.value

    let session = null
    if (token) {
      try {
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) {
          session = { user }
        }
      } catch (error) {
        // Token inválido, continuar sin sesión
        console.log('Invalid token in middleware')
      }
    }

    const url = req.nextUrl.clone()

    // Si no hay sesión y está en una ruta protegida, redirigir a login
    if (!session && isProtectedRoute(url.pathname)) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Si hay sesión, realizar verificaciones de onboarding
    if (session) {
      // Si está en login/register después de autenticarse, verificar onboarding
      if (isAuthRoute(url.pathname)) {
        try {
          const onboardingStatus = await checkOnboardingStatus(supabase, session.user.id)
          
          if (onboardingStatus.completed) {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          } else {
            url.pathname = '/onboarding/select-role'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          console.error('Error checking onboarding in auth route:', error)
        }
      }

      // Si está en el dashboard pero no ha completado el onboarding
      if (url.pathname === '/dashboard') {
        try {
          const onboardingStatus = await checkOnboardingStatus(supabase, session.user.id)
          
          if (!onboardingStatus.completed) {
            url.pathname = '/onboarding/select-role'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          console.error('Error checking onboarding in dashboard:', error)
        }
      }

      // Si está en rutas de onboarding pero ya completó el proceso
      if (isOnboardingRoute(url.pathname)) {
        try {
          const onboardingStatus = await checkOnboardingStatus(supabase, session.user.id)
          
          if (onboardingStatus.completed) {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          console.error('Error checking onboarding in onboarding route:', error)
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error in middleware:', error)
    // En caso de error, permitir continuar sin bloquear
    return NextResponse.next()
  }
}

// Función para verificar el estado del onboarding
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

// Función para determinar si es una ruta protegida
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/profile',
    '/settings'
  ]
  
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// Función para determinar si es una ruta de autenticación
function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/login',
    '/register',
    '/auth/callback'
  ]
  
  return authRoutes.includes(pathname)
}

// Función para determinar si es una ruta de onboarding
function isOnboardingRoute(pathname: string): boolean {
  return pathname.startsWith('/onboarding')
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 