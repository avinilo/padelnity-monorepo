"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePreloader } from "@/hooks/usePreloader"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import Preloader from "@/components/Preloader"
import { useAuth } from "@/hooks/useAuth"

export default function Home() {
  // Splash screen que aparece cada vez que se abre la app
  const { showSplashScreen, isAppReady, completeSplashScreen } = usePreloader()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState("Cargando...")
  const [splashCompleted, setSplashCompleted] = useState(false)

  // Función para completar splash screen
  const handleSplashComplete = () => {
    completeSplashScreen()
    setSplashCompleted(true)
  }

  // Marcar splash como completado si no se muestra
  useEffect(() => {
    if (!showSplashScreen && isAppReady) {
      setSplashCompleted(true)
    }
  }, [showSplashScreen, isAppReady])

  // ✅ OPTIMIZACIÓN: Redirigir con feedback específico después del splash screen
  useEffect(() => {
    if (splashCompleted && isAppReady && !loading && !isTransitioning) {
      setIsTransitioning(true)
      
      if (!user) {
        setTransitionMessage("Redirigiendo al registro...")
        setTimeout(() => {
          router.push('/register')
        }, 800) // Breve delay para mostrar feedback
      } else {
        setTransitionMessage("Accediendo al dashboard...")
        setTimeout(() => {
          router.push('/dashboard')
        }, 800)
      }
    }
  }, [splashCompleted, isAppReady, loading, user, router, isTransitioning])

  return (
    <main className="h-screen w-screen">
      {/* Mostrar preloader principal si es necesario */}
      {showSplashScreen && (
        <Preloader onComplete={handleSplashComplete} />
      )}
      
      {/* ✅ LOADING SCREEN: Transición suave usando componente estandarizado */}
      {isTransitioning && (
        <LoadingScreen 
          isVisible={true}
          message={transitionMessage}
          variant="fullscreen"
        />
      )}
      
      {/* ✅ LOADING SCREEN: Fallback durante verificación de sesión */}
      {!showSplashScreen && !isAppReady && !isTransitioning && (
        <LoadingScreen 
          isVisible={true}
          message="Verificando sesión..."
          variant="fullscreen"
        />
      )}
    </main>
  )
} 