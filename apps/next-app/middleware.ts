import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware simplificado temporalmente para evitar errores 500
  // Solo permitir el paso de todas las requests sin verificación de autenticación
  
  const url = req.nextUrl.clone()
  
  // Log para debug en producción
  console.log('Middleware ejecutándose para:', url.pathname)
  
  // Permitir todas las rutas por ahora
  return NextResponse.next()
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