"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Image from "next/image"

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

  // Detectar si es PWA instalada
  useEffect(() => {
    const checkPWA = () => {
      const isPWAInstalled = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://') ||
        window.location.href.includes('?pwa=true')
      
      setIsPWA(isPWAInstalled)
    }
    
    checkPWA()
  }, [])

  // Configuración dinámica basada en si es PWA
  const CONFIG = useMemo(() => ({
    DURATION: isPWA ? 1200 : 2000, // Más rápido en PWA
    EXIT_DURATION: 200,
    INITIAL_DELAY: isPWA ? 100 : 200, // Inicio más rápido en PWA
    EXIT_DELAY: 50,
    CIRCLE_RADIUS: 32,
    PARTICLE_COUNT: isPWA ? 3 : 6 // Menos partículas en PWA
  }), [isPWA])

  // Mensajes más rápidos para PWA
  const LOADING_MESSAGES = useMemo(() => 
    isPWA ? [
      "Abriendo app...",
      "Cargando datos...",
      "¡Listo!"
    ] : [
      "Preparando tu experiencia...",
      "Conectando con la comunidad...",
      "Cargando torneos...",
      "Sincronizando datos...",
      "¡Ya casi estamos!"
    ], [isPWA]
  )

  // Función de progreso optimizada para PWA
  const getProgressCurve = useCallback((elapsed: number): number => {
    const normalizedTime = Math.min(elapsed / CONFIG.DURATION, 1)
    
    if (isPWA) {
      // Para PWA: progreso más lineal y rápido
      return Math.min(normalizedTime * 105, 100)
    }
    
    if (normalizedTime <= 0.6) {
      const fastPhase = normalizedTime / 0.6
      return fastPhase * fastPhase * 60
    } else if (normalizedTime <= 0.9) {
      const slowPhase = (normalizedTime - 0.6) / 0.3
      return 60 + (slowPhase * 21)
    } else {
      const finalPhase = (normalizedTime - 0.9) / 0.1
      return 81 + (finalPhase * finalPhase * finalPhase * 19)
    }
  }, [CONFIG.DURATION, isPWA])

  // Actualización de mensajes contextuales
  const updateMessage = useCallback((currentProgress: number) => {
    const messageIndex = Math.min(
      Math.floor((currentProgress / 100) * LOADING_MESSAGES.length),
      LOADING_MESSAGES.length - 1
    )
    setCurrentMessageIndex(messageIndex)
  }, [LOADING_MESSAGES.length])

  // Función principal de animación
  const startAnimation = useCallback(() => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(getProgressCurve(elapsed), 100)
      
      setProgress(newProgress)
      updateMessage(newProgress)
      
      if (newProgress < 100 && elapsed < CONFIG.DURATION) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          setIsExiting(true)
          onComplete?.()
        }, CONFIG.EXIT_DELAY)
      }
    }
    
    requestAnimationFrame(animate)
  }, [getProgressCurve, updateMessage, onComplete, CONFIG.DURATION, CONFIG.EXIT_DELAY])

  useEffect(() => {
    const timer = setTimeout(startAnimation, CONFIG.INITIAL_DELAY)
    return () => clearTimeout(timer)
  }, [startAnimation, CONFIG.INITIAL_DELAY])

  // Cálculos memoizados para el círculo SVG
  const circumference = useMemo(() => 2 * Math.PI * CONFIG.CIRCLE_RADIUS, [CONFIG.CIRCLE_RADIUS])
  const strokeDashoffset = useMemo(() => 
    circumference * (1 - progress / 100), 
    [circumference, progress]
  )

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 transition-all duration-300 ${
      isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
    }`}>
      {/* Efectos de fondo optimizados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        {!isPWA && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-ping" />
        )}
      </div>

      {/* Partículas decorativas */}
      {!isPWA && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: CONFIG.PARTICLE_COUNT }, (_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-white/30 rounded-full transition-all duration-500 ${
                isExiting ? 'animate-none opacity-0 scale-0' : 'animate-bounce'
              }`}
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${3 + i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Contenido principal */}
      <div className={`relative z-10 flex flex-col items-center space-y-12 transition-all duration-500 ${
        isExiting ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}>
        {/* Logo con animación de entrada */}
        <div className={`flex flex-col items-center space-y-4 transition-all duration-700 delay-100 ${
          progress > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="relative">
            <Image
              src="/logo/logoblancoinicio.png"
              alt="Padelnity Logo"
              width={200}
              height={0}
              className="h-24 w-auto object-contain"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-110 animate-pulse" />
          </div>
          <p className="text-base text-white/80 font-medium">
            Tu comunidad padelista
          </p>
        </div>

        {/* Spinner principal */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
          
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90" 
            viewBox="0 0 96 96"
            aria-hidden="true"
          >
            <circle
              cx="48"
              cy="48"
              r={CONFIG.CIRCLE_RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-200 ease-out"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' }}
            />
          </svg>

          <div className="absolute inset-0 animate-spin">
            <div 
              className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1.5" 
              style={{ boxShadow: '0 0 16px rgba(255,255,255,0.8)' }} 
            />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Mensaje dinámico */}
        <div className="text-center min-h-[50px] flex items-center justify-center">
          <div className="text-white/90 text-xl font-medium transition-all duration-300">
            {LOADING_MESSAGES[currentMessageIndex]}
          </div>
        </div>
      </div>

      {/* Indicador PWA */}
      {isPWA && (
        <div className="absolute top-4 right-4 text-white/60 text-xs font-medium">
          PWA Mode
        </div>
      )}
    </div>
  )
} 