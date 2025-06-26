import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión, no hacemos nada, las páginas se protegerán solas si es necesario.
  if (!session) return response

  // Si hay sesión, verificamos el estado del onboarding.
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', session.user.id)
    .single()
    
  const isOnboardingComplete = profile?.onboarding_complete
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')

  if (!isOnboardingComplete && !isOnboardingPage) {
    return NextResponse.redirect(new URL('/onboarding/select-role', request.url))
  } else if (isOnboardingComplete && isOnboardingPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth|login).*)'],
} 