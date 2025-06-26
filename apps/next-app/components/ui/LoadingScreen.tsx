import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  isVisible: boolean
  message?: string
  variant?: 'fullscreen' | 'overlay' | 'inline'
  className?: string
}

/**
 * Componente reutilizable para mostrar estados de loading
 * Mantiene consistencia visual en toda la aplicación
 */
export function LoadingScreen({ 
  isVisible, 
  message = 'Cargando...', 
  variant = 'fullscreen',
  className 
}: LoadingScreenProps) {
  if (!isVisible) return null

  const baseClasses = "flex flex-col items-center justify-center"
  
  const variantClasses = {
    fullscreen: "fixed inset-0 bg-background z-50",
    overlay: "absolute inset-0 bg-background/80 backdrop-blur-sm z-40",
    inline: "py-8"
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
      {message && (
        <p className="text-muted-foreground text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}

LoadingScreen.displayName = 'LoadingScreen' 