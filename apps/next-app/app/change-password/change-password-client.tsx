'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { memo, useMemo, useCallback, useState, useEffect } from "react"
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/useToast"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"
import { useLoadingState } from "@/hooks/useLoadingState"


// TypeScript Interfaces
interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    match: boolean
  }
}

interface PasswordState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordConfig {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
}

// Centralized Configuration
const PASSWORD_CONFIG: PasswordConfig = {
  minLength: 6,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true
}

const PASSWORD_STRENGTH_CONFIG = {
  weak: { score: 1, label: 'Débil', color: 'text-red-600' },
  fair: { score: 2, label: 'Regular', color: 'text-orange-600' },
  good: { score: 3, label: 'Buena', color: 'text-yellow-600' },
  strong: { score: 4, label: 'Fuerte', color: 'text-emerald-600' }
}

// Custom Hooks
const usePasswordStrength = (password: string): PasswordStrength => {
  return useMemo(() => {
    const requirements = {
      length: password.length >= PASSWORD_CONFIG.minLength,
      lowercase: /(?=.*[a-z])/.test(password),
      uppercase: /(?=.*[A-Z])/.test(password),
      number: /(?=.*\d)/.test(password),
      match: true // This will be handled separately for confirmPassword
    }

    const score = Object.values(requirements).filter(Boolean).length - 1 // Exclude match from score
    
    if (score <= 1) return { ...PASSWORD_STRENGTH_CONFIG.weak, requirements }
    if (score === 2) return { ...PASSWORD_STRENGTH_CONFIG.fair, requirements }
    if (score === 3) return { ...PASSWORD_STRENGTH_CONFIG.good, requirements }
    return { ...PASSWORD_STRENGTH_CONFIG.strong, requirements }
  }, [password])
}

const usePasswordForm = () => {
  const [passwords, setPasswords] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const newPasswordStrength = usePasswordStrength(passwords.newPassword)
  const passwordsMatch = passwords.newPassword === passwords.confirmPassword && passwords.newPassword.length > 0

  // ✅ NUEVA INFRAESTRUCTURA: Loading states optimizados
  const {
    loading: isSubmitting,
    error,
    executeWithLoading,
    clearError,
    reset
  } = useLoadingState()

  const { updatePassword: updatePasswordSupabase } = useAuth()
  const { success, error: showError } = useToast()
  const router = useRouter()

  const canSubmit = useMemo(() => {
    return passwords.currentPassword.length > 0 &&
           newPasswordStrength.score >= 3 &&
           passwordsMatch &&
           !isSubmitting
  }, [passwords.currentPassword, newPasswordStrength.score, passwordsMatch, isSubmitting])

  const updatePasswordField = useCallback((field: string, value: string) => {
    setPasswords((prev: PasswordState) => ({ ...prev, [field]: value }))
    setSubmitSuccess(false)
  }, [])

  const togglePasswordVisibility = useCallback((field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    // Blur active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    // ✅ NUEVA IMPLEMENTACIÓN: Loading state suave
    try {
      await executeWithLoading(async () => {
        const { error } = await updatePasswordSupabase(passwords.newPassword)
        
        if (error) {
          const errorMessage = (error as any)?.message || ""
          if (errorMessage.includes('same password')) {
            showError("La nueva contraseña debe ser diferente a la actual")
          } else if (errorMessage.includes('Password should be at least')) {
            showError("Tu contraseña necesita ser más segura")
          } else {
            showError("No se pudo cambiar - Inténtalo de nuevo en unos segundos")
          }
          return
        }
        
        // Éxito - mostrar mensaje y redirigir
        success("¡Contraseña actualizada! - Tu contraseña se ha cambiado exitosamente")
        
        // Breve delay para mostrar el mensaje antes de redirigir
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        
      })
      
    } catch (error) {
      showError("Error temporal - Inténtalo de nuevo en unos segundos")
    }
  }, [canSubmit, passwords.newPassword, updatePasswordSupabase, executeWithLoading, success, showError, router])

  return {
    passwords,
    showPasswords,
    isSubmitting,
    submitSuccess,
    newPasswordStrength,
    passwordsMatch,
    canSubmit,
    updatePassword: updatePasswordField,
    togglePasswordVisibility,
    handleSubmit
  }
}

// Memoized Components
const PasswordStrengthIndicator = memo(({ 
  password, 
  isKeyboardOpen 
}: { 
  password: string
  isKeyboardOpen: boolean 
}) => {
  const strength = usePasswordStrength(password)
  
  if (!password || isKeyboardOpen) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Seguridad:</span>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength.score 
                ? strength.score <= 1 ? 'bg-red-500'
                  : strength.score === 2 ? 'bg-orange-500'
                  : strength.score === 3 ? 'bg-yellow-500'
                  : 'bg-emerald-500'
                : 'bg-gray-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center ${strength.requirements.length ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
          6+ caracteres
        </div>
        <div className={`flex items-center ${strength.requirements.lowercase ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
          Minúscula
        </div>
        <div className={`flex items-center ${strength.requirements.uppercase ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
          Mayúscula
        </div>
        <div className={`flex items-center ${strength.requirements.number ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
          Número
        </div>
      </div>
    </div>
  )
})

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator'

const PasswordField = memo(({ 
  id,
  label,
  placeholder,
  value, 
  showPassword, 
  onChange, 
  onToggleVisibility,
  error,
  icon: IconComponent,
  showStrength = false,
  isKeyboardOpen = false
}: {
  id: string
  label: string
  placeholder: string
  value: string
  showPassword: boolean
  onChange: (value: string) => void
  onToggleVisibility: () => void
  error?: string
  icon: React.ComponentType<{ className?: string }>
  showStrength?: boolean
  isKeyboardOpen?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </Label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IconComponent className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 pr-10 h-12 text-base ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'}`}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
    {error && (
      <p id={`${id}-error`} className="text-sm text-red-600 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
        {error}
      </p>
    )}
    {showStrength && (
      <PasswordStrengthIndicator password={value} isKeyboardOpen={isKeyboardOpen} />
    )}
  </div>
))

PasswordField.displayName = 'PasswordField'

const NavigationLinks = memo(({ isKeyboardOpen }: { isKeyboardOpen: boolean }) => {
  if (isKeyboardOpen) return null

  return (
    <div className="mt-4 sm:mt-6 text-center space-y-3">
      <div className="text-sm sm:text-base text-white">
        <Link
          href="/"
          className="font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline" aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>
      
      {/* Help link */}
      <div className="text-center">
        <Link
          href="/help"
          className="text-xs text-white/80 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        >
          ¿Necesitas ayuda?
        </Link>
      </div>
    </div>
  )
})

NavigationLinks.displayName = 'NavigationLinks'

// Main Client Component
export default function ChangePasswordClient() {
  const { isKeyboardVisible } = useKeyboardDetection()
  const {
    passwords,
    showPasswords,
    isSubmitting,
    submitSuccess,
    newPasswordStrength,
    passwordsMatch,
    canSubmit,
    updatePassword,
    togglePasswordVisibility,
    handleSubmit
  } = usePasswordForm()

  // ✅ LOADING SCREEN: Mostrar durante envío del formulario
  if (isSubmitting) {
    return (
      <LoadingScreen 
        isVisible={true}
        message="Actualizando contraseña..."
        variant="fullscreen"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
      {/* Background effects - responsive sizes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <Card className="shadow-xl border-0" style={{ backgroundColor: '#F4FAF7' }}>
          <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-6 ${isKeyboardVisible ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
            <div className="flex justify-center">
              <Image
                src="/logo/logoverde.webp"
                alt="Padelnity - Logo"
                width={140}
                height={70}
                className="w-auto h-auto object-contain max-w-[140px] max-h-[70px] sm:max-w-[160px] sm:max-h-[80px]"
                priority
              />
            </div>
            <div className={isKeyboardVisible ? 'space-y-1' : 'space-y-2'}>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Cambiar Contraseña
              </CardTitle>
              {!isKeyboardVisible && (
                <p className="text-sm sm:text-base text-gray-600">
                  Actualiza tu contraseña de forma segura
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardVisible ? 'space-y-4' : 'space-y-5 sm:space-y-6'}`}>
            {submitSuccess && (
              <div className="flex items-center justify-center text-emerald-600 text-sm font-medium p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                ¡Contraseña cambiada exitosamente!
              </div>
            )}

            <form onSubmit={handleSubmit} className={isKeyboardVisible ? 'space-y-4' : 'space-y-5'}>
              <PasswordField
                id="currentPassword"
                label="Contraseña actual"
                placeholder="Ingresa tu contraseña actual"
                value={passwords.currentPassword}
                showPassword={showPasswords.currentPassword}
                onChange={(value) => updatePassword('currentPassword', value)}
                onToggleVisibility={() => togglePasswordVisibility('currentPassword')}
                icon={Lock}
                isKeyboardOpen={isKeyboardVisible}
              />

              <PasswordField
                id="newPassword"
                label="Nueva contraseña"
                placeholder="Ingresa tu nueva contraseña"
                value={passwords.newPassword}
                showPassword={showPasswords.newPassword}
                onChange={(value) => updatePassword('newPassword', value)}
                onToggleVisibility={() => togglePasswordVisibility('newPassword')}
                icon={Shield}
                showStrength={true}
                isKeyboardOpen={isKeyboardVisible}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirmar nueva contraseña"
                placeholder="Confirma tu nueva contraseña"
                value={passwords.confirmPassword}
                showPassword={showPasswords.confirmPassword}
                onChange={(value) => updatePassword('confirmPassword', value)}
                onToggleVisibility={() => togglePasswordVisibility('confirmPassword')}
                {...(passwords.confirmPassword && !passwordsMatch && {
                  error: 'Las contraseñas no coinciden'
                })}
                icon={Shield}
                isKeyboardOpen={isKeyboardVisible}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                {isSubmitting ? "Cambiando contraseña..." : "Cambiar contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <NavigationLinks isKeyboardOpen={isKeyboardVisible} />
      </div>
    </div>
  )
} 