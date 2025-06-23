"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User } from "lucide-react"

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Redirigir a register si no está autenticado (consistente con useAuth)
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push('/register')
    }
  }, [user, loading, router, isLoggingOut])

  // Toast de bienvenida eliminado - se maneja desde login/page.tsx para evitar duplicados

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const { error } = await signOut()
      
      if (!error) {
        toast.success("¡Hasta pronto!", "Sesión cerrada correctamente")
        // useAuth se encargará de la redirección a /register
      } else {
        toast.error("Error al cerrar sesión", "Inténtalo de nuevo")
        setIsLoggingOut(false)
      }
    } catch (error) {
      // Error ya manejado arriba - evitar toast duplicado
      setIsLoggingOut(false)
    }
  }

  // Mostrar loading mientras verifica autenticación O está haciendo logout
  if (loading || isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-white/80 text-sm">
          {isLoggingOut ? "Cerrando sesión..." : "Verificando sesión..."}
        </p>
      </div>
    )
  }

  // No mostrar nada si no está autenticado (se redirige)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <User className="w-6 h-6" />
            Dashboard
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">
              ¡Bienvenido a Padelnity!
            </h2>
            <p className="text-sm text-gray-600">
              Email: <strong>{user.email}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Usuario ID: {user.id}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-center text-gray-700">
              Dashboard principal - Próximamente más funciones
            </p>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                  Cerrando sesión...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 