import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Obtener la sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()

  // Si no hay sesión y está en una ruta protegida, redirigir a login
  if (!session && isProtectedRoute(url.pathname)) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay sesión y está en rutas de auth, verificar onboarding
  if (session) {
    // Si está en login/register después de autenticarse, verificar onboarding
    if (isAuthRoute(url.pathname)) {
      const onboardingStatus = await checkOnboardingStatus(supabase, session.user.id)
      
      if (onboardingStatus.completed) {
        // Si ya completó el onboarding, ir al dashboard
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      } else {
        // Si no ha completado el onboarding, ir a selección de rol
        url.pathname = '/onboarding/select-role'
        return NextResponse.redirect(url)
      }
    }

    // Si está en el dashboard pero no ha completado el onboarding
    if (url.pathname === '/dashboard') {
      const onboardingStatus = await checkOnboardingStatus(supabase, session.user.id)
      
      if (!onboardingStatus.completed) {
        url.pathname = '/onboarding/select-role'
        return NextResponse.redirect(url)
      }
    }

    // Si está en rutas de onboarding pero ya completó el proceso
    if (isOnboardingRoute(url.pathname)) {
      const onboardingStatus = await checkOnboardingStatus(supabase, session.user.id)
      
      if (onboardingStatus.completed) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return res
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