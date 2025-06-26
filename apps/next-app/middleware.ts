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

    const url = req.nextUrl.clone()
    
    // Obtener todas las cookies para debugging
    const allCookies = req.cookies.getAll()
    
    // Buscar cookies de Supabase de manera más amplia
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.startsWith('sb.') ||
      cookie.name.includes('auth-token') ||
      cookie.name.includes('access-token') ||
      cookie.name.includes('refresh-token')
    )

    let session = null
    let user = null

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Path:', url.pathname)
      console.log('Middleware - Supabase cookies found:', supabaseCookies.map(c => c.name))
    }

    // Intentar obtener el usuario de diferentes maneras
    for (const cookie of supabaseCookies) {
      try {
        // Intentar usar el valor del cookie como token de acceso
        const { data: { user: tokenUser }, error } = await supabase.auth.getUser(cookie.value)
        
        if (tokenUser && !error) {
          user = tokenUser
          session = { user: tokenUser }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Middleware - User found with cookie:', cookie.name)
          }
          break
        }
      } catch (error) {
        // Continuar con el siguiente cookie
        continue
      }
    }

    // Si no encontramos usuario con cookies individuales, intentar con Authorization header
    if (!session) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const { data: { user: tokenUser }, error } = await supabase.auth.getUser(token)
          if (tokenUser && !error) {
            user = tokenUser
            session = { user: tokenUser }
          }
        } catch (error) {
          // Continuar sin sesión
        }
      }
    }

    // Si no hay sesión y está en una ruta protegida, redirigir a login
    if (!session && isProtectedRoute(url.pathname)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Middleware - Redirecting to login, no session for protected route')
      }
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Si hay sesión, realizar verificaciones de onboarding
    if (session && user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Middleware - User authenticated:', user.id)
      }

      // Si está en login/register después de autenticarse, verificar onboarding
      if (isAuthRoute(url.pathname)) {
        try {
          const onboardingStatus = await checkOnboardingStatus(supabase, user.id)
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Middleware - Onboarding status:', onboardingStatus)
          }
          
          if (onboardingStatus.completed) {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          } else {
            url.pathname = '/onboarding/select-role'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          console.error('Error checking onboarding in auth route:', error)
          // En caso de error, permitir continuar a select-role
          url.pathname = '/onboarding/select-role'
          return NextResponse.redirect(url)
        }
      }

      // Si está en el dashboard pero no ha completado el onboarding
      if (url.pathname === '/dashboard') {
        try {
          const onboardingStatus = await checkOnboardingStatus(supabase, user.id)
          
          if (!onboardingStatus.completed) {
            url.pathname = '/onboarding/select-role'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          console.error('Error checking onboarding in dashboard:', error)
          // En caso de error, redirigir a onboarding para estar seguros
          url.pathname = '/onboarding/select-role'
          return NextResponse.redirect(url)
        }
      }

      // Si está en rutas de onboarding pero ya completó el proceso
      if (isOnboardingRoute(url.pathname)) {
        try {
          const onboardingStatus = await checkOnboardingStatus(supabase, user.id)
          
          if (onboardingStatus.completed) {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          console.error('Error checking onboarding in onboarding route:', error)
          // En caso de error en onboarding, permitir continuar
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
    const { data: playerProfile, error: playerError } = await supabase
      .from('players')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle()

    if (playerError && playerError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('Error checking player profile:', playerError)
    }

    if (playerProfile?.onboarding_complete) {
      return { completed: true, type: 'player' }
    }

    // Verificar si el usuario tiene un perfil de negocio en cualquiera de las tablas
    const businessTables = ['clubs', 'tiendas', 'academias', 'instalaciones']
    
    for (const table of businessTables) {
      try {
        const { data: businessProfile, error: businessError } = await supabase
          .from(table)
          .select('onboarding_complete')
          .eq('user_id', userId)
          .maybeSingle()

        if (businessError && businessError.code !== 'PGRST116') {
          console.log(`Error checking ${table} profile:`, businessError)
          continue
        }

        // Para clubs y tiendas verificar onboarding_complete
        // Para academias e instalaciones, solo verificar que exista el registro
        const isCompleted = (table === 'clubs' || table === 'tiendas') 
          ? businessProfile?.onboarding_complete 
          : !!businessProfile

        if (isCompleted) {
          return { completed: true, type: 'business' }
        }
      } catch (error) {
        console.log(`Error checking ${table}:`, error)
        continue
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