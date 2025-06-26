"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User } from "lucide-react"

// Configuration
const DASHBOARD_CONFIG = {
  redirectRoute: '/register',
  messages: {
    logoutSuccess: "Sesión cerrada correctamente",
    logoutError: "Inténtalo de nuevo",
    verifyingSession: "Verificando sesión...",
    loggingOut: "Cerrando sesión..."
  }
} as const

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { success, error } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push(DASHBOARD_CONFIG.redirectRoute)
    }
  }, [user, loading, router, isLoggingOut])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    
    try {
      const { error: logoutError } = await signOut()
      
      if (!logoutError) {
        success(DASHBOARD_CONFIG.messages.logoutSuccess)
        // useAuth handles redirect automatically
      } else {
        error(DASHBOARD_CONFIG.messages.logoutError)
        setIsLoggingOut(false)
      }
    } catch (errorCatch) {
      error(DASHBOARD_CONFIG.messages.logoutError)
      setIsLoggingOut(false)
    }
  }, [signOut, success, error])

  // Loading screen
  if (loading || isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-white/80 text-sm">
          {isLoggingOut ? DASHBOARD_CONFIG.messages.loggingOut : DASHBOARD_CONFIG.messages.verifyingSession}
        </p>
      </div>
    )
  }

  // Don't render if not authenticated (redirecting)
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
                  {DASHBOARD_CONFIG.messages.loggingOut}
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