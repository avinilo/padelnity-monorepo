"use client"

import { memo } from "react"

interface LoadingSpinnerProps {
  show: boolean
  message?: string
  size?: "sm" | "md" | "lg"
  variant?: "overlay" | "inline" | "fixed"
}

const LoadingSpinner = memo(function LoadingSpinner({ 
  show, 
  message = "Cargando...", 
  size = "md",
  variant = "overlay" 
}: LoadingSpinnerProps) {
  if (!show) return null

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  const containerClasses = {
    overlay: "fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40",
    inline: "flex items-center justify-center p-4",
    fixed: "fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-40"
  }

  const Spinner = () => (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin`} />
      {message && (
        <span className="text-sm font-medium text-gray-700">
          {message}
        </span>
      )}
    </div>
  )

  return (
    <div className={containerClasses[variant]}>
      {variant === "overlay" ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Spinner />
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  )
})

export default LoadingSpinner 