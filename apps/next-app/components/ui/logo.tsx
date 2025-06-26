import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 'md', 
  showText = true,
  href = "/"
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-lg">P</span>
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Padelnity
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-transform hover:scale-105">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
} 