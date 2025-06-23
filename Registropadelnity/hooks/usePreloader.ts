"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"

interface SplashState {
  showSplashScreen: boolean
  showOperationLoader: boolean
  isAppReady: boolean
}

interface UseSplashReturn {
  showSplashScreen: boolean
  showOperationLoader: boolean
  isAppReady: boolean
  
  completeSplashScreen: () => void
  startOperation: (operationName?: string) => void
  completeOperation: () => void
  
  currentOperation: string | null
}

const SESSION_KEY = "padelnity_session_active"

export function usePreloader(): UseSplashReturn {
  const pathname = usePathname()
  
  const [state, setState] = useState<SplashState>({
    showSplashScreen: false,
    showOperationLoader: false,
    isAppReady: true
  })

  const isAppStart = useCallback(() => {
    try {
      const hasActiveSession = sessionStorage.getItem(SESSION_KEY)
      return !hasActiveSession
    } catch (error) {
      console.warn("Error detectando apertura de app:", error)
      return true
    }
  }, [])

  useEffect(() => {
    if (pathname === "/") {
      const shouldShowSplash = isAppStart()
      
      setState({
        showSplashScreen: shouldShowSplash,
        showOperationLoader: false,
        isAppReady: !shouldShowSplash
      })
      
      if (shouldShowSplash) {
        try {
          sessionStorage.setItem(SESSION_KEY, "true")
        } catch (error) {
          console.warn("Error marcando sesión activa:", error)
        }
      }
    }
  }, [pathname, isAppStart])
  
  const [currentOperation, setCurrentOperation] = useState<string | null>(null)

  const markSessionActive = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "true")
    } catch (error) {
      console.warn("Error saving session state:", error)
    }
  }, [])

  const completeSplashScreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSplashScreen: false,
      isAppReady: true
    }))
    markSessionActive()
  }, [markSessionActive])

  const startOperation = useCallback((operationName: string = "Cargando...") => {
    setCurrentOperation(operationName)
    setState(prev => ({
      ...prev,
      showOperationLoader: true
    }))
  }, [])

  const completeOperation = useCallback(() => {
    setCurrentOperation(null)
    setState(prev => ({
      ...prev,
      showOperationLoader: false
    }))
  }, [])

  useEffect(() => {
    if (pathname !== "/") {
      markSessionActive()
    }
  }, [pathname, markSessionActive])

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.removeItem(SESSION_KEY)
      } catch {
        // Error silencioso al limpiar sesión
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markSessionActive()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [markSessionActive])

  return {
    showSplashScreen: state.showSplashScreen,
    showOperationLoader: state.showOperationLoader,
    isAppReady: state.isAppReady,
    
    completeSplashScreen,
    startOperation,
    completeOperation,
    
    currentOperation
  }
} 