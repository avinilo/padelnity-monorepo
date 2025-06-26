"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/hooks/useAuth"
import FloatingChat from "@/components/floating-chat"

// Background Pattern Component
const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>
)

// Logo Component  
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

// Screen Container
const ScreenContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
    <BackgroundPattern />
    <div className="relative z-10 w-full max-w-sm">
      {children}
    </div>
    <FloatingChat />
  </div>
)

// Types
interface PasswordData {
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  newPassword?: string
  confirmPassword?: string
}

interface PasswordResetWithTokenProps {
  isKeyboardOpen: boolean
}

// Simple validation function
const validatePasswords = (newPassword: string, confirmPassword: string): FormErrors => {
  const errors: FormErrors = {}
  
  if (newPassword.length < 6) {
    errors.newPassword = "Mínimo 6 caracteres"
  }
  
  if (confirmPassword && newPassword !== confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden"
  }
  
  return errors
}

export default function PasswordResetWithToken({ isKeyboardOpen }: PasswordResetWithTokenProps) {
  // State
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Hooks
  const { isKeyboardVisible } = useKeyboardDetection()
  const { success, error } = useToast()
  const { updatePassword } = useAuth()

  // Computed values
  const canSubmit = useMemo(() => {
    return passwordData.newPassword.length >= 6 && 
           passwordData.confirmPassword.length >= 6 &&
           passwordData.newPassword === passwordData.confirmPassword
  }, [passwordData.newPassword, passwordData.confirmPassword])

  // Handlers
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validatePasswords(passwordData.newPassword, passwordData.confirmPassword)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      error("Por favor corrige los errores antes de continuar")
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await updatePassword(passwordData.newPassword)
      
      if (updateError) {
        error("Inténtalo de nuevo más tarde")
        return
      }

      setIsSuccess(true)
      
    } catch (errorCatch) {
      error("Inténtalo de nuevo más tarde")
    } finally {
      setIsLoading(false)
    }
  }, [passwordData, error, updatePassword])

  if (isSuccess) {
    return (
      <ScreenContainer>
        <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600">
              Tu contraseña ha sido cambiada exitosamente
            </p>
          </CardContent>
        </Card>

        <div className="mt-4 sm:mt-6 space-y-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full text-white hover:text-white/90 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Iniciar sesión
          </Link>
        </div>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl">
        <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-8 ${isKeyboardOpen ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
          <Logo />
          <div className={isKeyboardOpen ? 'space-y-1' : 'space-y-2'}>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Nueva contraseña
            </CardTitle>
            {!isKeyboardOpen && (
              <p className="text-sm sm:text-base text-gray-600">
                Elige una contraseña segura para tu cuenta
              </p>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardOpen ? 'space-y-4' : 'space-y-6'}`}>
          <form onSubmit={handleSubmit} className={isKeyboardOpen ? 'space-y-3' : 'space-y-4'} noValidate>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Nueva contraseña
              </Label>
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                  if (errors.newPassword) {
                    const newErrors = { ...errors }
                    delete newErrors.newPassword
                    setErrors(newErrors)
                  }
                }}
                {...(errors.newPassword && { error: errors.newPassword })}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu nueva contraseña"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) {
                    const newErrors = { ...errors }
                    delete newErrors.confirmPassword
                    setErrors(newErrors)
                  }
                }}
                {...(errors.confirmPassword && { error: errors.confirmPassword })}
                className="h-12 text-base"
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold mt-6"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!isKeyboardOpen && (
        <div className="mt-4 sm:mt-6 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-white hover:text-white/90 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al inicio de sesión
          </Link>
        </div>
      )}
    </ScreenContainer>
  )
} 