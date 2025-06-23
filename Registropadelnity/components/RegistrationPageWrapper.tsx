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
interface FormData {
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

interface ValidationRule {
  test: (value: string, formData?: FormData) => boolean
  message: string
}

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

// Constants
const VALIDATION_RULES: Record<keyof FormData, ValidationRule[]> = {
  email: [
    {
      test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Ingresa un email válido"
    }
  ],
  password: [
    {
      test: (value) => value.length >= 6,
      message: "Mínimo 6 caracteres"
    },
    {
      test: (value) => /(?=.*[a-z])/.test(value),
      message: "Debe contener al menos una minúscula"
    },
    {
      test: (value) => /(?=.*[A-Z])/.test(value),
      message: "Debe contener al menos una mayúscula"
    },
    {
      test: (value) => /(?=.*\d)/.test(value),
      message: "Debe contener al menos un número"
    }
  ],
  confirmPassword: [
    {
      test: (value, formData) => value === formData?.password,
      message: "Las contraseñas no coinciden"
    }
  ]
}

const FORM_CONFIG = {
  fields: {
    email: {
      type: "email" as const,
      placeholder: "Correo electrónico",
      icon: Mail,
      autoComplete: "email",
      required: true,
      inputMode: "email" as const
    },
    password: {
      type: "password" as const,
      placeholder: "Contraseña (mín. 6 caracteres)",
      icon: Lock,
      autoComplete: "new-password",
      required: true,
      inputMode: "text" as const
    },
    confirmPassword: {
      type: "password" as const,
      placeholder: "Confirmar contraseña",
      icon: Lock,
      autoComplete: "new-password",
      required: true,
      inputMode: "text" as const
    }
  },
  messages: {
    success: "¡Cuenta creada exitosamente!",
    verificationSent: "Te hemos enviado un email de verificación",
    formIncomplete: "Por favor corrige los errores antes de continuar",
    unexpectedError: "Error inesperado, inténtalo de nuevo más tarde"
  },
  google: {
    text: "Continuar con Google",
    ariaLabel: "Registrarse con Google"
  }
} as const

const PASSWORD_STRENGTH_CONFIG = {
  weak: { score: 1, label: "Débil", color: "text-red-600" },
  fair: { score: 2, label: "Regular", color: "text-orange-600" },
  good: { score: 3, label: "Buena", color: "text-yellow-600" },
  strong: { score: 4, label: "Fuerte", color: "text-emerald-600" }
} as const



// Custom hooks
const useFormValidation = () => {
  const validateField = useCallback((
    field: keyof FormData, 
    value: string, 
    formData: FormData
  ): string | undefined => {
    if (!value.trim()) return undefined

    const rules = VALIDATION_RULES[field]
    for (const rule of rules) {
      if (!rule.test(value, formData)) {
        return rule.message
      }
    }
    return undefined
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

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev)
  }, [])

  return {
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword
  }
}

const usePasswordStrength = (password: string): PasswordStrength => {
  return useMemo(() => {
    const requirements = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      match: true // This will be handled separately for confirm password
    }

    const score = Object.values(requirements).filter(Boolean).length
    
    let config
    if (score <= 1) config = PASSWORD_STRENGTH_CONFIG.weak
    else if (score <= 2) config = PASSWORD_STRENGTH_CONFIG.fair
    else if (score <= 3) config = PASSWORD_STRENGTH_CONFIG.good
    else config = PASSWORD_STRENGTH_CONFIG.strong

    return {
      ...config,
      requirements
    }
  }, [password])
}

// Sub-components
const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({ 
  password, 
  isKeyboardOpen 
}: { 
  password: string
  isKeyboardOpen: boolean 
}) {
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
                ? strength.score === 1 ? 'bg-red-500'
                : strength.score === 2 ? 'bg-orange-500'
                : strength.score === 3 ? 'bg-yellow-500'
                : 'bg-emerald-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
})

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator'

const GoogleSignupButton = memo(function GoogleSignupButton({
  onGoogleSignup,
  isGoogleLoading,
  isLoading
}: {
  onGoogleSignup: () => void
  isGoogleLoading: boolean
  isLoading: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onGoogleSignup}
      className="w-full h-12 sm:h-14 text-sm sm:text-base border-gray-300 hover:bg-gray-50 active:scale-95 transition-transform"
      loading={isGoogleLoading}
      disabled={isLoading || isGoogleLoading}
      aria-label={FORM_CONFIG.google.ariaLabel}
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {FORM_CONFIG.google.text}
    </Button>
  )
})

GoogleSignupButton.displayName = 'GoogleSignupButton'

const FormSeparator = memo(function FormSeparator() {
  return (
    <div className="relative">
      <Separator className="bg-gray-200" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-white px-3 text-xs sm:text-sm text-gray-500 font-medium">
          o continúa con email
        </span>
      </div>
    </div>
  )
})

FormSeparator.displayName = 'FormSeparator'

const NavigationLinks = memo(function NavigationLinks({ 
  isKeyboardOpen 
}: { 
  isKeyboardOpen: boolean 
}) {
  if (isKeyboardOpen) return null

  return (
    <div className="mt-6 text-center space-y-3">
      <p className="text-sm sm:text-base text-white/90">
        ¿Ya tienes cuenta?{" "}
        <Link 
          href="/login" 
          className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
      
      {/* Legal text */}
      <div className="text-xs text-white/90 leading-relaxed text-center px-4">
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

const LogoutModal = memo(function LogoutModal({
  isOpen,
  onClose,
  userEmail,
  onLogout
}: {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  onLogout: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            ¡Ya tienes una sesión activa!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Estás conectado como <span className="font-medium">{userEmail}</span>
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Continuar sesión
            </Button>
            <Button
              onClick={onLogout}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

LogoutModal.displayName = 'LogoutModal'

// Main component
export default function RegistrationPageWrapper() {
  // Estado local para operaciones de loading (sin usar usePreloader)
  const [operationLoading, setOperationLoading] = useState({
    show: false,
    message: "Cargando..."
  })

  // State
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [lastSubmitTime, setLastSubmitTime] = useState(0)
  const [countdown, setCountdown] = useState(0)

  // Hooks
  const router = useRouter()
  const { toast } = useToast()
  const { signUpWithOtp, user, loading, signInWithGoogle, signOut, verifyOtp } = useAuth()
  const { validateField, validateForm } = useFormValidation()
  const { 
    showPassword, 
    showConfirmPassword, 
    togglePassword, 
    toggleConfirmPassword 
  } = usePasswordVisibility()
  const isKeyboardOpen = useKeyboardDetection()

  // ✅ OPTIMIZACIÓN: Redirigir usuario logueado sin causar re-renders
  useEffect(() => {
    if (!loading && user && !showOtpInput) {
      // Usuario ya logueado - redirigir al dashboard silenciosamente
      router.push('/dashboard')
    }
  }, [user, loading, router, showOtpInput])

  // Funciones para manejar loading local
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

  const handleSignUpError = useCallback((error: any) => {
    const errorMessage = error?.message || ""
    
    if (errorMessage.includes('already registered') || 
        errorMessage.includes('User already registered') ||
        errorMessage.includes('email address is already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('user already exists')) {
      toast.info("¡Ya tienes una cuenta!", "Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?")
    } else if (errorMessage.includes('Password should be at least')) {
      toast.error("Contraseña muy débil", "Tu contraseña necesita ser más segura")
    } else if (errorMessage.includes('Invalid email')) {
      toast.error("Email inválido", "Por favor verifica tu dirección de email")
    } else if (errorMessage.includes('rate_limit') || 
               errorMessage.includes('too many requests') ||
               errorMessage.includes('For security purposes')) {
      toast.error("Demasiados intentos", "Espera unos minutos antes de intentar de nuevo")
    } else {
      toast.error("No se pudo crear la cuenta", "Inténtalo de nuevo en unos segundos")
    }
  }, [toast])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Blur active element to hide mobile keyboard
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    // Rate limiting - prevenir spam de requests
    const now = Date.now()
    const timeDiff = now - lastSubmitTime
    if (timeDiff < 10000) { // 10 segundos entre intentos
      const remainingSeconds = Math.ceil((10000 - timeDiff) / 1000)
      toast.error("¡Calma!", `Espera ${remainingSeconds} segundos antes de intentar de nuevo`)
      setCountdown(remainingSeconds)
      return
    }
    
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      toast.error("Faltan datos", "Completa todos los campos para continuar")
      return
    }

    setLastSubmitTime(now)
    setIsLoading(true)
    startOperation("Creando tu cuenta...")
    
    try {
      const { error } = await signUpWithOtp(formData.email, formData.password)
      
      if (error) {
        handleSignUpError(error)
        return
      }

      // Guardar email y mostrar input OTP
      setRegistrationEmail(formData.email)
      setShowOtpInput(true)
      setCountdown(60)
      toast.success("¡Código enviado!", "Revisa tu email para verificar tu cuenta")
      
    } catch (error) {
      toast.error("Error temporal", "Inténtalo de nuevo en unos segundos")
    } finally {
      setIsLoading(false)
      completeOperation()
    }
  }, [formData, validateForm, signUpWithOtp, toast, handleSignUpError, startOperation, completeOperation, lastSubmitTime])

  const handleOtpSubmit = useCallback(async () => {
    if (otpCode.length !== 6) {
      toast.error("Código incompleto", "Ingresa los 6 dígitos del código")
      return
    }

    setIsLoading(true)
    startOperation("Verificando código...")
    
    try {
      const result = await verifyOtp(registrationEmail, otpCode, formData.password)
      
      if (result.error) {
        const errorMessage = (result.error as any)?.message || ""
        if (errorMessage.includes('invalid') || errorMessage.includes('expired')) {
          toast.error("Código incorrecto", "Verifica el código o solicita uno nuevo")
        } else {
          toast.error("No se pudo verificar", "Inténtalo de nuevo o solicita un nuevo código")
        }
        return
      }

      if (result.data?.user) {
        toast.success("¡Cuenta creada!", "Bienvenido a Padelnity")
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error("Error de verificación", "Inténtalo de nuevo o solicita un nuevo código")
    } finally {
      setIsLoading(false)
      completeOperation()
    }
  }, [otpCode, registrationEmail, verifyOtp, toast, router, startOperation, completeOperation, formData.password])

  const handleGoogleSignup = useCallback(async () => {
    setIsGoogleLoading(true)
    startOperation("Conectando con Google...")
    
    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        toast.error("Error con Google", "No se pudo completar el registro. Inténtalo de nuevo")
        return
      }
      
      // El redirect se maneja automáticamente
    } catch (error) {
      // Error ya manejado arriba - evitar toast duplicado
    } finally {
      setIsGoogleLoading(false)
      completeOperation()
    }
  }, [signInWithGoogle, toast, startOperation, completeOperation])

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await signOut()
      
      if (error) {
        toast.error("Error al cerrar sesión", "Inténtalo de nuevo")
        return
      }
      
      setShowLogoutModal(false)
      router.push('/login')
      
    } catch (error) {
      // Error ya manejado arriba - evitar toast duplicado
    }
  }, [signOut, toast, router])

  const handleResendCode = useCallback(async () => {
    if (!registrationEmail) {
      toast.error("Error temporal", "Inténtalo de nuevo")
      return
    }

    // Rate limiting
    const now = Date.now()
    const timeDiff = now - lastSubmitTime
    if (timeDiff < 60000) { // 60 segundos entre intentos
      const remainingSeconds = Math.ceil((60000 - timeDiff) / 1000)
      setCountdown(remainingSeconds)
      toast.info("¡Calma!", `Puedes solicitar un nuevo código en ${remainingSeconds} segundos`)
      return
    }

    setLastSubmitTime(now)
    setIsLoading(true)
    
    try {
      const { error } = await signUpWithOtp(registrationEmail, formData.password)
      
      if (error) {
        const errorMessage = (error as any)?.message || ""
        if (errorMessage.includes('security') || errorMessage.includes('request')) {
          setCountdown(60)
          toast.info("Límite de seguridad", "Espera un minuto antes de solicitar otro código")
          return
        }
        
        handleSignUpError(error)
        return
      }

      toast.success("¡Código reenviado!", "Revisa tu email")
      setCountdown(60)
      
    } catch (error) {
      toast.error("Error al reenviar", "Inténtalo de nuevo más tarde")
    } finally {
      setIsLoading(false)
    }
  }, [registrationEmail, signUpWithOtp, formData.password, toast, handleSignUpError, lastSubmitTime])

  // Effects - Modal de logout eliminado para flujo directo

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Validate confirm password when password changes
  useEffect(() => {
    if (formData.confirmPassword && formData.password) {
      const error = validateField('confirmPassword', formData.confirmPassword, formData)
      setErrors(prev => {
        const newErrors = { ...prev }
        if (error) {
          newErrors.confirmPassword = error
        } else {
          delete newErrors.confirmPassword
        }
        return newErrors
      })
    }
  }, [formData.password, formData.confirmPassword, formData, validateField])

  // Render helpers
  const renderPasswordField = useCallback((
    field: 'password' | 'confirmPassword',
    isVisible: boolean,
    toggleVisibility: () => void
  ) => {
    const config = FORM_CONFIG.fields[field]
    const IconComponent = config.icon

    return (
      <div>
        <div className="relative">
          <IconComponent 
            className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" 
            aria-hidden="true"
          />
          <PasswordInput
            type={isVisible ? "text" : "password"}
            placeholder={config.placeholder}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="pl-11 pr-12 h-12 sm:h-14 text-base"
            error={errors[field]}
            success={!!(formData[field] && !errors[field])}
            autoComplete={config.autoComplete}
            required={config.required}
            inputMode={config.inputMode}
            aria-describedby={errors[field] ? `${field}-error` : undefined}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleVisibility}
            className="absolute right-2 top-[24px] sm:top-[28px] transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 p-0 z-10 hover:bg-gray-100 transition-colors"
            aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            )}
          </Button>
          {errors[field] && (
            <p id={`${field}-error`} className="sr-only" role="alert">
              {errors[field]}
            </p>
          )}
        </div>
        {field === 'password' && (
          <PasswordStrengthIndicator 
            password={formData.password} 
            isKeyboardOpen={isKeyboardOpen}
          />
        )}
      </div>
    )
  }, [formData, errors, handleInputChange, isKeyboardOpen])

  return (
    <>
      {/* Loading para operaciones */}
      <LoadingSpinner 
        show={operationLoading.show} 
        message={operationLoading.message} 
        variant="overlay"
      />

      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
        {/* Background effects - responsive sizes */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl">
            <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-8 ${isKeyboardOpen ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
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
              <div className={isKeyboardOpen ? 'space-y-1' : 'space-y-2'}>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                  Únete a Padelnity
                </CardTitle>
                {!isKeyboardOpen && (
                  <p className="text-sm sm:text-base text-gray-600">
                    La comunidad de pádel más grande
                  </p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardOpen ? 'space-y-4' : 'space-y-6'}`}>
              {showOtpInput ? (
                // OTP Verification Form
                <div className={isKeyboardOpen ? 'space-y-3' : 'space-y-4'}>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Verifica tu cuenta
                    </h3>
                    <p className="text-sm text-gray-600">
                      Hemos enviado un código de 6 dígitos a{' '}
                      <strong>{registrationEmail}</strong>
                    </p>

                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="Código de 6 dígitos"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest h-12 sm:h-14"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      aria-label="Código de verificación"
                    />
                  </div>

                  <Button 
                    onClick={handleOtpSubmit}
                    className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                    loading={isLoading}
                    disabled={otpCode.length !== 6 || isLoading}
                    aria-label="Verificar código"
                  >
                    Verificar código
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={handleResendCode}
                    className="w-full mt-3 h-12 sm:h-14 text-sm sm:text-base font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || countdown > 0}
                  >
                    {countdown > 0 ? `Espera ${countdown}s` : 'Reenviar código'}
                  </Button>

                  {!isKeyboardOpen && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() => setShowOtpInput(false)}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al registro
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Registration Form
                <>
              {/* Google signup */}
              <GoogleSignupButton
                onGoogleSignup={handleGoogleSignup}
                isGoogleLoading={isGoogleLoading}
                isLoading={isLoading}
              />

              <FormSeparator />

              {/* Registration form */}
              <form onSubmit={handleSubmit} className={isKeyboardOpen ? 'space-y-3' : 'space-y-4'} noValidate>
                {/* Email field */}
                <div>
                  <div className="relative">
                    <Mail 
                      className="absolute left-3 top-[24px] sm:top-[28px] transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                      aria-hidden="true"
                    />
                    <Input
                      type="email"
                      placeholder={FORM_CONFIG.fields.email.placeholder}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-11 h-12 sm:h-14 text-base"
                      error={errors.email}
                      success={!!(formData.email && !errors.email)}
                      autoComplete={FORM_CONFIG.fields.email.autoComplete}
                      required={FORM_CONFIG.fields.email.required}
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
                {renderPasswordField('password', showPassword, togglePassword)}

                {/* Confirm password field */}
                {renderPasswordField('confirmPassword', showConfirmPassword, toggleConfirmPassword)}

                <Button 
                  type="submit"
                  className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold active:scale-95 transition-transform mt-6"
                  loading={isLoading}
                  disabled={isSubmitDisabled}
                  aria-label="Crear cuenta nueva"
                >
                      {countdown > 0 ? `Espera ${countdown}s` : 'Crear cuenta'}
                </Button>
              </form>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation links */}
          <NavigationLinks isKeyboardOpen={isKeyboardOpen} />
        </div>

        {/* Logout modal */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          userEmail={userEmail}
          onLogout={handleLogout}
        />

        {/* Floating chat */}
        <FloatingChat />
      </div>
    </>
  )
} 