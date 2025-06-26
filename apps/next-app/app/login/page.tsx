"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import FloatingChat from "@/components/floating-chat"

// Hooks
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/hooks/useAuth"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"
import { useLoadingState } from "@/hooks/useLoadingState"

// Types
type LoginFormData = {
  email: string
  password: string
}

// Configuration
const VALIDATION_RULES = {
  email: {
    required: 'El email es requerido',
    invalid: 'Email inválido',
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: 'La contraseña es requerida',
    minLength: 'La contraseña debe tener al menos 6 caracteres',
    min: 6
  }
} as const

const ERROR_MESSAGES = {
  invalidCredentials: "Credenciales incorrectas. Verifica tu email y contraseña",
  emailNotConfirmed: "Cuenta no verificada. Revisa tu email y verifica tu cuenta antes de continuar",
  tooManyRequests: "Demasiados intentos. Espera unos minutos antes de intentar de nuevo",
  googleError: "Error con Google. No se pudo completar el inicio de sesión. Inténtalo de nuevo",
  generalError: "No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo",
  temporaryError: "Error temporal. Inténtalo de nuevo en unos segundos",
  formIncomplete: "Faltan datos. Completa tu email y contraseña para continuar"
} as const

// Custom Hooks
const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<keyof LoginFormData, string>>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const validateField = useCallback((field: keyof LoginFormData, value: string): string => {
    switch (field) {
      case 'email':
        if (!value.trim()) return VALIDATION_RULES.email.required
        if (!VALIDATION_RULES.email.regex.test(value)) return VALIDATION_RULES.email.invalid
        return ''
      case 'password':
        if (!value) return VALIDATION_RULES.password.required
        if (value.length < VALIDATION_RULES.password.min) return VALIDATION_RULES.password.minLength
        return ''
      default:
        return ''
    }
  }, [])

  const validateForm = useCallback((data: LoginFormData): Record<keyof LoginFormData, string> => {
    return {
      email: validateField('email', data.email),
      password: validateField('password', data.password)
    }
  }, [validateField])

  const handleInputChange = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const isFormValid = formData.email.trim() && formData.password.trim() && !errors.email && !errors.password

  return {
    formData,
    errors,
    showPassword,
    isFormValid,
    setErrors,
    setShowPassword,
    handleInputChange,
    validateForm
  }
}

const useAuthHandlers = () => {
  const { signIn, signInWithGoogle } = useAuth()
  const { error: showToast, success } = useToast()

  const handleSignInError = useCallback((error: any) => {
    const errorMessage = error?.message || ""
    
    if (errorMessage.includes('Invalid login credentials')) {
      showToast(ERROR_MESSAGES.invalidCredentials)
    } else if (errorMessage.includes('Email not confirmed')) {
      showToast(ERROR_MESSAGES.emailNotConfirmed)
    } else if (errorMessage.includes('Too many requests') || errorMessage.includes('rate_limit')) {
      showToast(ERROR_MESSAGES.tooManyRequests)
    } else {
      showToast(ERROR_MESSAGES.generalError)
    }
  }, [showToast])

  return {
    signIn,
    signInWithGoogle,
    showToast,
    success,
    handleSignInError
  }
}

// Main component
export default function LoginPage() {
  // Hooks
  const router = useRouter()
  const { user, loading } = useAuth()
  const { isKeyboardVisible } = useKeyboardDetection()
  const {
    isLoading: isFormLoading,
    setLoading,
    executeWithLoading
  } = useLoadingState()
  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const {
    formData,
    errors,
    showPassword,
    isFormValid,
    setErrors,
    setShowPassword,
    handleInputChange,
    validateForm
  } = useLoginForm()

  const {
    signIn,
    signInWithGoogle,
    showToast,
    success,
    handleSignInError
  } = useAuthHandlers()

  // Computed values
  const isSubmitDisabled = !isFormValid || isFormLoading || isGoogleLoading

  // User redirect
  useEffect(() => {
    if (!loading && user) {
      setLoading(true)
      router.push('/dashboard')
    }
  }, [user, loading, router, setLoading])

  // Event handlers
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Hide mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.values(formErrors).some(error => error)) {
      showToast(ERROR_MESSAGES.formIncomplete)
      return
    }

    try {
      await executeWithLoading(async () => {
        const { error } = await signIn(formData.email, formData.password)
        
        if (error) {
          handleSignInError(error)
          return
        }

        success("¡Bienvenido de vuelta! Iniciando sesión...")
      })
    } catch (error) {
      showToast(ERROR_MESSAGES.temporaryError)
    }
  }, [formData, validateForm, setErrors, showToast, executeWithLoading, signIn, handleSignInError, success])

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true)
    
    try {
      setLoading(true)
      
      const { error } = await signInWithGoogle()
      
      if (error) {
        showToast(ERROR_MESSAGES.googleError)
        return
      }
    } catch (error) {
      // Error already handled
    } finally {
      setIsGoogleLoading(false)
      setLoading(false)
    }
  }, [signInWithGoogle, showToast, setLoading])

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [setShowPassword])

  // Loading screens
  if (loading) {
    return (
      <LoadingScreen 
        isVisible={true}
        message="Verificando sesión..."
        variant="fullscreen"
      />
    )
  }

  if (isFormLoading || isGoogleLoading) {
    return (
      <LoadingScreen 
        isVisible={true}
        message="Cargando..."
        variant="fullscreen"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl">
          <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-8 ${isKeyboardVisible ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
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
                Bienvenido de nuevo
              </CardTitle>
              {!isKeyboardVisible && (
                <p className="text-sm sm:text-base text-gray-600">
                  Accede a tu cuenta de Padelnity
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardVisible ? 'space-y-4' : 'space-y-6'}`}>
            {/* Google login */}
            <Button
              variant="outline"
              className="w-full h-12 sm:h-14 text-sm sm:text-base border-gray-300 hover:bg-gray-50 font-medium active:scale-95"
              onClick={handleGoogleLogin}
              loading={isGoogleLoading}
              disabled={isGoogleLoading}
              aria-label="Iniciar sesión con Google"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="truncate">Continuar con Google</span>
            </Button>

            <div className="relative">
              <Separator className="bg-gray-200" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="px-4 text-xs sm:text-sm font-medium tracking-wide bg-white/95 text-gray-500"
                  aria-label="O continúa con email"
                >
                  o continúa con email
                </span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className={isKeyboardVisible ? 'space-y-3' : 'space-y-4'} noValidate>
              {/* Email field */}
              <div>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                    aria-hidden="true"
                  />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-11 h-12 sm:h-14 text-base"
                    error={errors.email}
                    success={!!(formData.email && !errors.email)}
                    autoComplete="email"
                    required
                    inputMode="email"
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="sr-only" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password field */}
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" 
                  aria-hidden="true"
                />
                <PasswordInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-11 pr-12 h-12 sm:h-14 text-base"
                  error={errors.password}
                  success={!!(formData.password && !errors.password)}
                  autoComplete="current-password"
                  required
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePassword}
                  className="absolute right-2 top-[24px] sm:top-[28px] transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 p-0 z-10"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
                {errors.password && (
                  <p id="password-error" className="sr-only" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="flex items-center justify-center">
                <div className="text-sm">
                  <Link 
                    href="/reset-password" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold active:scale-95 mt-6"
                loading={isFormLoading}
                disabled={isSubmitDisabled}
                aria-label="Iniciar sesión"
              >
                Iniciar sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Registration link */}
        <div className="mt-4 sm:mt-6 text-center space-y-3">
          <div className="text-sm sm:text-base text-white">
            ¿Nuevo en Padelnity?{" "}
            <Link
              href="/"
              className="font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              Crear cuenta
            </Link>
          </div>
          
          {/* Legal links */}
          <div className="text-xs text-white/90 leading-relaxed text-center">
            Al hacer login, aceptas nuestros<br />
            <Link
              href="/terms"
              className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              Términos y Condiciones
            </Link>
            {" "}•{" "}
            <Link
              href="/privacy"
              className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              Política de Privacidad
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
      </div>

      <FloatingChat />
    </div>
  )
} 