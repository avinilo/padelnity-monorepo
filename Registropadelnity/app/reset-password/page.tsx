'use client'

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import FloatingChat from "@/components/floating-chat"
import PasswordResetWithToken from "./reset-password-with-token"
import { useAuth } from '@/hooks/useAuth'
import { useKeyboardDetection } from '@/hooks/useKeyboardDetection'
import { useToast } from '@/hooks/useToast'
import { useLoadingState } from '@/hooks/useLoadingState'

// TypeScript Interfaces
interface FormData {
  email: string
}

interface FormErrors {
  email?: string
}

// Componente de fondo reutilizable
const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>
)

// Componente de logo reutilizable
const Logo = () => (
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
)

// Componente base de contenedor
const ScreenContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
    <BackgroundPattern />
    <div className="relative z-10 w-full max-w-sm">
      {children}
    </div>
    <FloatingChat />
  </div>
)

// Pantalla de verificación OTP
const OtpScreen = ({ 
  email, 
  otpCode, 
  setOtpCode, 
  onSubmit, 
  onResend, 
  onBack, 
  countdown, 
  isLoading, 
  isKeyboardOpen 
}: {
  email: string
  otpCode: string
  setOtpCode: (code: string) => void
  onSubmit: () => void
  onResend: () => void
  onBack: () => void
  countdown: number
  isLoading: boolean
  isKeyboardOpen: boolean
}) => (
  <ScreenContainer>
    <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl">
      <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-8 ${isKeyboardOpen ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
        <Logo />
        <div className={isKeyboardOpen ? 'space-y-1' : 'space-y-2'}>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Código de verificación
          </CardTitle>
          {!isKeyboardOpen && (
            <p className="text-sm sm:text-base text-gray-600">
              Ingresa el código enviado a {email}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardOpen ? 'space-y-4' : 'space-y-6'}`}>
        <div className={isKeyboardOpen ? 'space-y-3' : 'space-y-4'}>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Verifica tu identidad
            </h3>
            <p className="text-sm text-gray-600">
              Código de 6 dígitos enviado a <strong>{email}</strong>
            </p>
          </div>

          <Input
            type="text"
            placeholder="Código de 6 dígitos"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg tracking-widest h-12 sm:h-14"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
          />

          <Button 
            onClick={onSubmit}
            className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
            disabled={otpCode.length !== 6 || isLoading}
          >
            {isLoading ? "Verificando..." : "Verificar código"}
          </Button>

          <Button 
            variant="outline"
            onClick={onResend}
            className="w-full h-12 sm:h-14 font-semibold"
            disabled={isLoading || countdown > 0}
          >
            {countdown > 0 ? `Espera ${countdown}s` : 'Reenviar código'}
          </Button>

          {!isKeyboardOpen && (
            <div className="text-center mt-4">
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al reset
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </ScreenContainer>
)

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const code = searchParams?.get('code')
  const type = searchParams?.get('type')

  const [formData, setFormData] = useState<FormData>({ email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isVerifyingToken, setIsVerifyingToken] = useState(false)

  const { toast } = useToast()
  const { resetPassword, verifyOtp } = useAuth()
  const isKeyboardOpen = useKeyboardDetection()
  const { isLoading, executeWithLoading } = useLoadingState()

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email es requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido'
    return ''
  }

  useEffect(() => {
    if ((token && type === 'recovery') || code) {
      setIsVerifyingToken(true)
      setShowPasswordForm(true)
    }
  }, [token, type, code])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    const emailError = validateEmail(formData.email)
    setErrors({ email: emailError })

    if (emailError) {
      toast.error("Email requerido", "Ingresa tu email para continuar")
      return
    }

    try {
      await executeWithLoading(async () => {
        const { error } = await resetPassword(formData.email)
        
        if (error) {
          if ((error as any)?.message?.includes('rate_limit')) {
            toast.error("Demasiados intentos", "Espera unos minutos antes de intentar de nuevo")
          } else {
            toast.error("No se pudo enviar", "Inténtalo de nuevo en unos segundos")
          }
          return
        }

        setShowOtpInput(true)
        setCountdown(60)
      }, "Enviando código...")
      
    } catch (error) {
      // Error ya manejado arriba - evitar toast duplicado
    }
  }

  const handleResendEmail = async () => {
    if (countdown > 0) return

    try {
      await executeWithLoading(async () => {
        const { error } = await resetPassword(formData.email)
        
        if (error) {
          toast.error("No se pudo reenviar", "Inténtalo de nuevo más tarde")
          return
        }

        setCountdown(60)
      }, "Reenviando código...")
      
    } catch (error) {
      // Error ya manejado arriba - evitar toast duplicado  
    }
  }

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Código incompleto", "Ingresa los 6 dígitos del código")
      return
    }

    try {
      await executeWithLoading(async () => {
        const { error } = await verifyOtp(formData.email, otpCode, 'recovery')
        
        if (error) {
          if ((error as any)?.message?.includes('invalid_otp')) {
            toast.error("Código incorrecto", "Verifica el código e inténtalo de nuevo")
          } else if ((error as any)?.message?.includes('expired')) {
            toast.error("Código expirado", "Solicita un nuevo código")
          } else {
            toast.error("No se pudo verificar", "Inténtalo de nuevo o solicita un nuevo código")
          }
          return
        }

        setShowPasswordForm(true)
        toast.success("¡Código verificado!", "Ahora puedes cambiar tu contraseña")
      }, "Verificando código...")
      
    } catch (error) {
      // Error ya manejado arriba - evitar toast duplicado
    }
  }

  if (isVerifyingToken && !showPasswordForm) {
    return (
      <LoadingScreen 
        isVisible={true}
        message="Verificando enlace de recuperación..."
        variant="fullscreen"
      />
    )
  }

  if (showPasswordForm) {
    return <PasswordResetWithToken isKeyboardOpen={isKeyboardOpen} />
  }

  if (showOtpInput) {
    return (
      <OtpScreen
        email={formData.email}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        onSubmit={handleOtpSubmit}
        onResend={handleResendEmail}
        onBack={() => setShowOtpInput(false)}
        countdown={countdown}
        isLoading={isLoading}
        isKeyboardOpen={isKeyboardOpen}
      />
    )
  }

  return (
    <ScreenContainer>
      <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl">
        <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-8 ${isKeyboardOpen ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
          <Logo />
          <div className={isKeyboardOpen ? 'space-y-1' : 'space-y-2'}>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Recuperar contraseña
            </CardTitle>
            {!isKeyboardOpen && (
              <p className="text-sm sm:text-base text-gray-600">
                Te enviaremos un código para restablecer tu contraseña
              </p>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardOpen ? 'space-y-4' : 'space-y-6'}`}>
          <form onSubmit={handleSubmit} className={isKeyboardOpen ? 'space-y-3' : 'space-y-4'} noValidate>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ email: e.target.value })
                  if (errors.email) setErrors({})
                }}
                className="pl-11 h-12 sm:h-14 text-base"
                error={errors.email}
                success={!!(formData.email && !errors.email)}
                autoComplete="email"
                required
                inputMode="email"
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold mt-6"
              disabled={!formData.email.trim() || isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar código de recuperación"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!isKeyboardOpen && (
        <div className="mt-4 sm:mt-6 text-center space-y-3">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-white hover:text-white/80 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al login
          </Link>
          
          <div className="text-xs text-white/90 leading-relaxed text-center">
            Al usar nuestros servicios, aceptas nuestros<br />
            <Link href="/terms" className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
              Términos y Condiciones
            </Link>
            {" "}•{" "}
            <Link href="/privacy" className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
              Política de Privacidad
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/help" className="text-xs text-gray-400 underline hover:text-gray-600">
              ¿Necesitas ayuda?
            </Link>
          </div>
        </div>
      )}
    </ScreenContainer>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen isVisible={true} message="Cargando..." variant="fullscreen" />}>
      <ResetPasswordContent />
    </Suspense>
  )
} 