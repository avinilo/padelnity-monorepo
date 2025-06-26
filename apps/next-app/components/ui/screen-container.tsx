import React from 'react'

interface ScreenContainerProps {
  children: React.ReactNode
  className?: string
}

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -inset-10 opacity-30">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
    </div>
  </div>
)

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 relative ${className}`}>
      <BackgroundPattern />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
} 