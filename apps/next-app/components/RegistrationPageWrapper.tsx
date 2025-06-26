"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, CheckCircle, ArrowLeft } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import FloatingChat from "@/components/floating-chat"
import LoadingSpinner from "@/components/LoadingSpinner"

// Hooks
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/hooks/useAuth"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// Types
type FormData = {
  email: string
  password: string
  confirmPassword: string
}

type FormErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

// Configuration
const VALIDATION_RULES = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: "Ingresa un email válido"
  },
  password: {
    length: { test: (value: string) => value.length >= 6, message: "Mínimo 6 caracteres" },
    lowercase: { test: (value: string) => /(?=.*[a-z])/.test(value), message: "Debe contener al menos una minúscula" },
    uppercase: { test: (value: string) => /(?=.*[A-Z])/.test(value), message: "Debe contener al menos una mayúscula" },
    number: { test: (value: string) => /(?=.*\d)/.test(value), message: "Debe contener al menos un número" }
  },
  confirmPassword: {
    match: (value: string, formData: FormData) => value === formData?.password
  }
} as const

const FORM_CONFIG = {
  fields: {
    email: { type: "email", placeholder: "Correo electrónico", icon: Mail, autoComplete: "email", inputMode: "email" },
    password: { type: "password", placeholder: "Contraseña (mín. 6 caracteres)", icon: Lock, autoComplete: "new-password" },
    confirmPassword: { type: "password", placeholder: "Confirmar contraseña", icon: Lock, autoComplete: "new-password" }
  },
  messages: {
    success: "¡Cuenta creada exitosamente!",
    verificationSent: "Te hemos enviado un email de verificación",
    formIncomplete: "Por favor corrige los errores antes de continuar",
    unexpectedError: "Error inesperado, inténtalo de nuevo más tarde"
  },
  google: { text: "Continuar con Google", ariaLabel: "Registrarse con Google" }
} as const

const PASSWORD_STRENGTH_CONFIG = {
  weak: { score: 1, label: "Débil", color: "text-red-600" },
  fair: { score: 2, label: "Regular", color: "text-orange-600" },
  good: { score: 3, label: "Buena", color: "text-yellow-600" },
  strong: { score: 4, label: "Fuerte", color: "text-emerald-600" }
} as const

const ERROR_MESSAGES = {
  userExists: "¡Ya tienes una cuenta! Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?",
  weakPassword: "Contraseña muy débil. Tu contraseña necesita ser más segura",
  invalidEmail: "Email inválido. Por favor verifica tu dirección de email",
  rateLimited: "Demasiados intentos. Espera unos minutos antes de intentar de nuevo",
  generalError: "No se pudo crear la cuenta. Inténtalo de nuevo en unos segundos",
  googleError: "Error con Google. No se pudo completar el registro. Inténtalo de nuevo"
} as const

// Custom hooks
const useFormValidation = () => {
  const validateField = useCallback((field: keyof FormData, value: string, formData: FormData): string | undefined => {
    if (!value.trim()) return undefined

    switch (field) {
      case 'email':
        return VALIDATION_RULES.email.test(value) ? undefined : VALIDATION_RULES.email.message
      case 'password':
        const passRules = VALIDATION_RULES.password
        if (!passRules.length.test(value)) return passRules.length.message
        if (!passRules.lowercase.test(value)) return passRules.lowercase.message
        if (!passRules.uppercase.test(value)) return passRules.uppercase.message
        if (!passRules.number.test(value)) return passRules.number.message
        return undefined
      case 'confirmPassword':
        return VALIDATION_RULES.confirmPassword.match(value, formData) ? undefined : "Las contraseñas no coinciden"
      default:
        return undefined
    }
  }, [])

  const validateForm = useCallback((formData: FormData): FormErrors => {
    const errors: FormErrors = {}
    
    Object.entries(formData).forEach(([key, value]) => {
      const field = key as keyof FormData
      if (!value.trim()) {
        errors[field] = `${FORM_CONFIG.fields[field].placeholder} es requerido`
        return
      }
      
      const error = validateField(field, value, formData)
      if (error) {
        errors[field] = error
      }
    })

    return errors
  }, [validateField])

  return { validateField, validateForm }
}

const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePassword = useCallback(() => setShowPassword(prev => !prev), [])
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), [])

  return { showPassword, showConfirmPassword, togglePassword, toggleConfirmPassword }
}

const usePasswordStrength = (password: string) => {
  return useMemo(() => {
    const requirements = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password)
    }

    const score = Object.values(requirements).filter(Boolean).length
    
    if (score >= 4) return { ...PASSWORD_STRENGTH_CONFIG.strong, requirements }
    if (score >= 3) return { ...PASSWORD_STRENGTH_CONFIG.good, requirements }
    if (score >= 2) return { ...PASSWORD_STRENGTH_CONFIG.fair, requirements }
    return { ...PASSWORD_STRENGTH_CONFIG.weak, requirements }
  }, [password])
}

// Optimized Components
const PasswordStrengthIndicator = memo(({ password, isKeyboardVisible }: { password: string; isKeyboardVisible: boolean }) => {
  const strength = usePasswordStrength(password)
  
  if (!password || isKeyboardVisible) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Seguridad de la contraseña</span>
        <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 rounded-full transition-colors ${
              level <= strength.score 
                ? strength.color.replace('text-', 'bg-')
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        {Object.entries(strength.requirements).map(([key, met]) => {
          const labels = {
            length: "6+ caracteres",
            lowercase: "Minúscula (a-z)",
            uppercase: "Mayúscula (A-Z)", 
            number: "Número (0-9)"
          }
          return (
            <div key={key} className="flex items-center space-x-1">
              <CheckCircle className={`w-3 h-3 ${met ? 'text-emerald-500' : 'text-gray-300'}`} />
              <span className={met ? 'text-emerald-600' : 'text-gray-400'}>{labels[key as keyof typeof labels]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator'

const GoogleSignupButton = memo(({ onGoogleSignup, isGoogleLoading, isLoading }: {
  onGoogleSignup: () => void
  isGoogleLoading: boolean
  isLoading: boolean
}) => (
  <Button
    variant="outline"
    className="w-full h-12 sm:h-14 text-sm sm:text-base border-gray-300 hover:bg-gray-50 font-medium active:scale-95"
    onClick={onGoogleSignup}
    loading={isGoogleLoading}
    disabled={isGoogleLoading || isLoading}
    aria-label={FORM_CONFIG.google.ariaLabel}
  >
    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span className="truncate">{FORM_CONFIG.google.text}</span>
  </Button>
))

GoogleSignupButton.displayName = 'GoogleSignupButton'

const FormSeparator = memo(() => (
  <div className="relative">
    <Separator className="bg-gray-200" />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="px-4 text-xs sm:text-sm font-medium tracking-wide bg-white/95 text-gray-500">
        o continúa con email
      </span>
    </div>
  </div>
))

FormSeparator.displayName = 'FormSeparator'

const NavigationLinks = memo(({ isKeyboardVisible }: { isKeyboardVisible: boolean }) => {
  if (isKeyboardVisible) return null

  return (
    <div className="mt-4 sm:mt-6 text-center space-y-3">
      <div className="text-sm sm:text-base text-white">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        >
          Inicia sesión
        </Link>
      </div>
      
      <div className="text-xs text-white/90 leading-relaxed text-center">
        Al registrarte, aceptas nuestros<br />
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

const LogoutModal = memo(({ isOpen, onClose, userEmail, onLogout }: {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  onLogout: () => void
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Ya tienes una sesión activa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Tienes una sesión activa con la cuenta:
            </p>
            <p className="font-medium text-emerald-600 break-all">
              {userEmail}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continuar sesión
            </Button>
            <Button onClick={onLogout} className="flex-1 bg-red-600 hover:bg-red-700">
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

LogoutModal.displayName = 'LogoutModal'

// Main optimized component
export default function RegistrationPageWrapper() {
  const { signUpWithEmailVerification, user, loading, signInWithGoogle, signOut } = useAuth()
  const { error, success, info } = useToast()
  const { isKeyboardVisible } = useKeyboardDetection()
  const router = useRouter()

  // Form state - optimizado y limpio
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [operationLoading, setOperationLoading] = useState({ show: false, message: "Cargando..." })
  
  // Estados para reenvío de email
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [lastResendTime, setLastResendTime] = useState(0)

  // Hooks
  const { validateField, validateForm } = useFormValidation()
  const { showPassword, showConfirmPassword, togglePassword, toggleConfirmPassword } = usePasswordVisibility()

  // User redirect
  useEffect(() => {
    if (!loading && user && !registrationComplete) {
      router.push('/dashboard')
    }
  }, [user, loading, router, registrationComplete])

  // Operation loading handlers
  const startOperation = useCallback((message: string) => {
    setOperationLoading({ show: true, message })
  }, [])

  const completeOperation = useCallback(() => {
    setOperationLoading({ show: false, message: "Cargando..." })
  }, [])

  // Computed values
  const isFormValid = useMemo(() => {
    const hasAllFields = Object.values(formData).every(value => value.trim())
    const hasNoErrors = Object.keys(errors).length === 0
    return hasAllFields && hasNoErrors
  }, [formData, errors])

  const isSubmitDisabled = useMemo(() => {
    return !isFormValid || isLoading || isGoogleLoading || countdown > 0
  }, [isFormValid, isLoading, isGoogleLoading, countdown])

  const userEmail = useMemo(() => {
    return (user as any)?.email || "usuario@ejemplo.com"
  }, [user])

  // Event handlers
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    if (value.length > 0 || errors[field]) {
      const error = validateField(field, value, { ...formData, [field]: value })
      setErrors(prev => {
        const newErrors = { ...prev }
        if (error) {
          newErrors[field] = error
        } else {
          delete newErrors[field]
        }
        return newErrors
      })
    }
  }, [formData, errors, validateField])

  const handleSignUpError = useCallback((errorData: any) => {
    const errorMessage = errorData?.message || ""
    
    if (errorMessage.includes('already registered') || errorMessage.includes('User already registered') || 
        errorMessage.includes('email address is already registered') || errorMessage.includes('already exists') || 
        errorMessage.includes('user already exists')) {
      info(ERROR_MESSAGES.userExists)
    } else if (errorMessage.includes('Password should be at least')) {
      error(ERROR_MESSAGES.weakPassword)
    } else if (errorMessage.includes('Invalid email')) {
      error(ERROR_MESSAGES.invalidEmail)
    } else if (errorMessage.includes('rate_limit') || errorMessage.includes('too many requests') || 
               errorMessage.includes('For security purposes')) {
      error(ERROR_MESSAGES.rateLimited)
    } else {
      error(ERROR_MESSAGES.generalError)
    }
  }, [error, info])

  // Función para reenviar email de verificación
  const handleResendEmail = useCallback(async () => {
    const now = Date.now()
    const timeDiff = now - lastResendTime
    
    // Verificar cooldown de 60 segundos
    if (timeDiff < 60000) {
      const remainingSeconds = Math.ceil((60000 - timeDiff) / 1000)
      error(`Debes esperar ${remainingSeconds} segundos antes de reenviar`)
      setResendCooldown(remainingSeconds)
      return
    }

    setIsResending(true)
    setLastResendTime(now)
    setResendCooldown(60) // Iniciar cooldown de 60 segundos
    
    try {
      // Reenviar email de verificación con la misma función
      const { error: resendError } = await signUpWithEmailVerification(registrationEmail, formData.password)
      
      if (resendError) {
        // Si hay error, no contar como reenvío exitoso
        setLastResendTime(0)
        setResendCooldown(0)
        
        if (resendError.message?.includes('rate_limit') || resendError.message?.includes('too many requests')) {
          error("Demasiados intentos. Espera unos minutos antes de intentar de nuevo")
        } else {
          error("No se pudo reenviar el email. Inténtalo más tarde")
        }
        return
      }

      success("Email de verificación reenviado correctamente")
      info("Revisa tu bandeja de entrada y spam")
      
    } catch (catchError) {
      setLastResendTime(0)
      setResendCooldown(0)
      error("Error al reenviar el email. Inténtalo más tarde")
    } finally {
      setIsResending(false)
    }
  }, [signUpWithEmailVerification, registrationEmail, formData.password, error, success, info, lastResendTime])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Hide mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    // Rate limiting
    const now = Date.now()
    const timeDiff = now - lastSubmitTime
    if (timeDiff < 10000) {
      const remainingSeconds = Math.ceil((10000 - timeDiff) / 1000)
      error(`Espera ${remainingSeconds} segundos antes de intentar de nuevo`)
      setCountdown(remainingSeconds)
      return
    }
    
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      error("Completa todos los campos para continuar")
      return
    }

    setLastSubmitTime(now)
    setIsLoading(true)
    startOperation("Creando tu cuenta...")
    
    try {
      const { error: signUpError } = await signUpWithEmailVerification(formData.email, formData.password)
      
      if (signUpError) {
        handleSignUpError(signUpError)
        return
      }

      setRegistrationEmail(formData.email)
      setRegistrationComplete(true)
      // Iniciar cooldown de 60s ya que Supabase acaba de enviar un email
      setLastResendTime(now)
      setResendCooldown(60)
      success("Revisa tu email para verificar tu cuenta")
      
    } catch (errorCatch) {
      error("Inténtalo de nuevo en unos segundos")
    } finally {
      setIsLoading(false)
      completeOperation()
    }
  }, [formData, validateForm, signUpWithEmailVerification, error, success, handleSignUpError, startOperation, completeOperation, lastSubmitTime])

  const handleGoogleSignup = useCallback(async () => {
    setIsGoogleLoading(true)
    startOperation("Conectando con Google...")
    
    try {
      const { error: googleError } = await signInWithGoogle()
      
      if (googleError) {
        error(ERROR_MESSAGES.googleError)
        return
      }
    } catch (errorCatch) {
      // Error already handled
    } finally {
      setIsGoogleLoading(false)
      completeOperation()
    }
  }, [signInWithGoogle, error, startOperation, completeOperation])

  const handleUserLogout = useCallback(async () => {
    try {
      await signOut()
      setShowLogoutModal(false)
      info("Ya puedes crear una nueva cuenta")
    } catch (errorCatch) {
      error("Inténtalo de nuevo")
    }
  }, [signOut, error, info])

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [countdown])

  // Resend cooldown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [resendCooldown])

  // Loading screens
  if (loading || operationLoading.show) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <LoadingSpinner show={true} size="lg" />
          <p className="text-lg font-medium">{operationLoading.message}</p>
        </div>
      </div>
    )
  }

  // Email verification sent screen
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Card className="shadow-2xl bg-white/95 backdrop-blur border-0 rounded-xl sm:rounded-2xl">
            <CardHeader className="text-center pt-8 pb-6 sm:pt-10 sm:pb-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/logo/logoverde.webp"
                  alt="Padelnity - Logo"
                  width={160}
                  height={80}
                  className="object-contain max-w-[160px] max-h-[80px]"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                ¡Revisa tu email!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Hemos enviado un enlace de verificación a<br />
                <span className="font-semibold text-emerald-600">{registrationEmail}</span>
              </p>
            </CardHeader>
            
            <CardContent className="px-6 pb-8 sm:px-8 sm:pb-10 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-blue-900 text-sm">Instrucciones:</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600 min-w-[20px]">1.</span>
                    <span>Abre tu aplicación de email</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600 min-w-[20px]">2.</span>
                    <span>Busca el email de Padelnity</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600 min-w-[20px]">3.</span>
                    <span>Haz clic en el enlace de verificación</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-emerald-600 min-w-[20px]">4.</span>
                    <span>Vuelve aquí para iniciar sesión</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link href="/login">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                    <span>Ir al Login</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
                
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  disabled={isResending || resendCooldown > 0}
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 py-3 rounded-lg transition-colors duration-200"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner show={true} size="sm" />
                      <span>Reenviando...</span>
                    </div>
                  ) : resendCooldown > 0 ? (
                    `Reenviar en ${resendCooldown}s`
                  ) : (
                    "Volver a enviar email"
                  )}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  ¿No recibiste el email? Revisa tu carpeta de spam<br />
                  o espera unos minutos e intenta de nuevo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main registration screen
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
                className="object-contain max-w-[140px] max-h-[70px] sm:max-w-[160px] sm:max-h-[80px]"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>
            <div className={isKeyboardVisible ? 'space-y-1' : 'space-y-2'}>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Únete a Padelnity
              </CardTitle>
              {!isKeyboardVisible && (
                <p className="text-sm sm:text-base text-gray-600">
                  Conecta con la comunidad padelista
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardVisible ? 'space-y-4' : 'space-y-6'}`}>
            <GoogleSignupButton
              onGoogleSignup={handleGoogleSignup}
              isGoogleLoading={isGoogleLoading}
              isLoading={isLoading}
            />

            <FormSeparator />

            {/* Registration form */}
            <form onSubmit={handleSubmit} className={isKeyboardVisible ? 'space-y-3' : 'space-y-4'} noValidate>
              {/* Email field */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <Input
                    type="email"
                    placeholder={FORM_CONFIG.fields.email.placeholder}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-11 h-12 sm:h-14 text-base"
                    error={errors.email || ""}
                    success={!!(formData.email && !errors.email)}
                    autoComplete={FORM_CONFIG.fields.email.autoComplete}
                    required
                    inputMode={FORM_CONFIG.fields.email.inputMode}
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
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" aria-hidden="true" />
                  <PasswordInput
                    type={showPassword ? "text" : "password"}
                    placeholder={FORM_CONFIG.fields.password.placeholder}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-11 pr-12 h-12 sm:h-14 text-base"
                    error={errors.password || ""}
                    success={!!(formData.password && !errors.password)}
                    autoComplete={FORM_CONFIG.fields.password.autoComplete}
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
                
                <PasswordStrengthIndicator 
                  password={formData.password} 
                  isKeyboardVisible={isKeyboardVisible}
                />
              </div>

              {/* Confirm Password field */}
              <div className="relative">
                <Lock className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" aria-hidden="true" />
                <PasswordInput
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={FORM_CONFIG.fields.confirmPassword.placeholder}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-11 pr-12 h-12 sm:h-14 text-base"
                  error={errors.confirmPassword || ""}
                  success={!!(formData.confirmPassword && !errors.confirmPassword)}
                  autoComplete={FORM_CONFIG.fields.confirmPassword.autoComplete}
                  required
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleConfirmPassword}
                  className="absolute right-2 top-[24px] sm:top-[28px] transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 p-0 z-10"
                  aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="sr-only" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold active:scale-95 mt-6"
                loading={isLoading}
                disabled={isSubmitDisabled}
                aria-label="Crear cuenta"
              >
                {countdown > 0 ? `Espera ${countdown}s` : "Crear cuenta"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <NavigationLinks isKeyboardVisible={isKeyboardVisible} />
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userEmail={userEmail}
        onLogout={handleUserLogout}
      />

      <FloatingChat />
    </div>
  )
} 
