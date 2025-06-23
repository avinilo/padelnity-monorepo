import { memo } from 'react'

interface LoadingScreenProps {
  isVisible: boolean
  message?: string
  variant?: 'fullscreen' | 'overlay' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  backgroundColor?: string
}

/**
 * Componente reutilizable para mostrar estados de loading
 * Mantiene consistencia visual en toda la aplicación
 */
export const LoadingScreen = memo(function LoadingScreen({
  isVisible,
  message = "Cargando...",
  variant = 'fullscreen',
  size = 'md',
  backgroundColor = 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
}: LoadingScreenProps) {
  if (!isVisible) return null

  const sizeClasses = {
    sm: { spinner: 'w-6 h-6', text: 'text-sm' },
    md: { spinner: 'w-8 h-8', text: 'text-base' },
    lg: { spinner: 'w-12 h-12', text: 'text-lg' }
  }

  const variantClasses = {
    fullscreen: `min-h-screen ${backgroundColor} flex flex-col items-center justify-center`,
    overlay: `fixed inset-0 z-50 ${backgroundColor} flex flex-col items-center justify-center`,
    inline: 'flex flex-col items-center justify-center py-8'
  }

  const { spinner, text } = sizeClasses[size]
  const containerClass = variantClasses[variant]

  return (
    <div className={containerClass}>
      <div 
        className={`${spinner} border-4 border-white/30 border-t-white rounded-full animate-spin mb-4`}
        role="status"
        aria-label="Cargando"
      />
      <p className={`text-white/90 ${text} text-center max-w-xs px-4`}>
        {message}
      </p>
    </div>
  )
})

LoadingScreen.displayName = 'LoadingScreen' 