'use client'

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useKeyboardDetection } from '@/hooks/useKeyboardDetection'

// TypeScript Interfaces
interface PasswordData {
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  newPassword?: string
  confirmPassword?: string
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

// Configuration
const PASSWORD_CONFIG = {
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
      match: true
    }

    const score = Object.values(requirements).filter(Boolean).length - 1
    
    if (score <= 1) return { ...PASSWORD_STRENGTH_CONFIG.weak, requirements }
    if (score === 2) return { ...PASSWORD_STRENGTH_CONFIG.fair, requirements }
    if (score === 3) return { ...PASSWORD_STRENGTH_CONFIG.good, requirements }
    return { ...PASSWORD_STRENGTH_CONFIG.strong, requirements }
  }, [password])
}

const useFormValidation = () => {
  const validatePasswordForm = useCallback((data: PasswordData): FormErrors => {
    const errors: FormErrors = {}
    
    if (!data.newPassword) {
      errors.newPassword = 'Nueva contraseña es requerida'
    } else {
      const requirements = {
        length: data.newPassword.length >= PASSWORD_CONFIG.minLength,
        lowercase: /(?=.*[a-z])/.test(data.newPassword),
        uppercase: /(?=.*[A-Z])/.test(data.newPassword),
        number: /(?=.*\d)/.test(data.newPassword)
      }
      const score = Object.values(requirements).filter(Boolean).length
      if (score < 3) {
        errors.newPassword = 'La contraseña debe ser más segura'
      }
    }
    
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Confirmar contraseña es requerida'
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    return errors
  }, [])

  return { validatePasswordForm }
}

// Componentes reutilizables
const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>
)

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

// Components
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null

  const requirements = {
    length: password.length >= 6,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password)
  }

  const score = Object.values(requirements).filter(Boolean).length

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Seguridad:</span>
        <span className={`text-xs font-medium ${
          score <= 1 ? 'text-red-600' :
          score === 2 ? 'text-orange-600' :
          score === 3 ? 'text-yellow-600' : 'text-emerald-600'
        }`}>
          {score <= 1 ? 'Débil' : score === 2 ? 'Regular' : score === 3 ? 'Buena' : 'Fuerte'}
        </span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= score 
                ? score <= 1 ? 'bg-red-500' :
                  score === 2 ? 'bg-orange-500' :
                  score === 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center ${requirements.length ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          6+ caracteres
        </div>
        <div className={`flex items-center ${requirements.lowercase ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Minúscula
        </div>
        <div className={`flex items-center ${requirements.uppercase ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Mayúscula
        </div>
        <div className={`flex items-center ${requirements.number ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Número
        </div>
      </div>
    </div>
  )
}

const PasswordField = ({ 
  id,
  label,
  placeholder,
  value, 
  showPassword, 
  onChange, 
  onToggleVisibility,
  error,
  showStrength = false
}: {
  id: string
  label: string
  placeholder: string
  value: string
  showPassword: boolean
  onChange: (value: string) => void
  onToggleVisibility: () => void
  error?: string
  showStrength?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </Label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Shield className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 pr-10 h-12 text-base ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'}`}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {error && (
      <p className="text-sm text-red-600 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
    {showStrength && <PasswordStrengthIndicator password={value} />}
  </div>
)

const SuccessScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
    <BackgroundPattern />
    <div className="relative z-10 w-full max-w-sm">
      <Card className="shadow-xl border-0" style={{ backgroundColor: '#F4FAF7' }}>
        <CardHeader className="text-center pt-6 pb-4 sm:pt-8 sm:pb-6 space-y-4 sm:space-y-6">
          <Logo />
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              ¡Contraseña actualizada!
            </CardTitle>
            <p className="text-sm sm:text-base text-gray-600">
              Ya puedes iniciar sesión con tu nueva contraseña
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-6 sm:px-6 sm:pb-8 space-y-6">
          <Link href="/login">
            <Button className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold">
              Ir al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  </div>
)

// Main Component
export default function PasswordResetWithToken({ 
  isKeyboardOpen 
}: { 
  isKeyboardOpen: boolean
}) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const { validatePasswordForm } = useFormValidation()
  const { toast } = useToast()
  const { updatePassword } = useAuth()
  
  const newPasswordStrength = usePasswordStrength(passwordData.newPassword)
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword
  
  const canSubmit = useMemo(() => {
    return passwordData.newPassword.length > 0 &&
           newPasswordStrength.score >= 3 &&
           passwordsMatch &&
           !isLoading
  }, [passwordData.newPassword, newPasswordStrength.score, passwordsMatch, isLoading])

  const handlePasswordChange = useCallback((field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [])

  const togglePasswordVisibility = useCallback((field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validatePasswordForm(passwordData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      toast.error("Formulario incompleto", "Por favor corrige los errores antes de continuar")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await updatePassword(passwordData.newPassword)
      
      if (result.error) {
        // El error ya se maneja en el hook useAuth
        return
      }
      
      if (result.data) {
        // Contraseña actualizada - redirigir silenciosamente
        setIsSuccess(true)
        
        // Pequeño delay para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      }
      
    } catch (error) {
      toast.error("Error inesperado", "Inténtalo de nuevo más tarde")
    } finally {
      setIsLoading(false)
    }
  }, [passwordData, validatePasswordForm, toast, updatePassword])

  if (isSuccess) {
    return <SuccessScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
      <BackgroundPattern />
      <div className="relative z-10 w-full max-w-sm">
        <Card className="shadow-xl border-0" style={{ backgroundColor: '#F4FAF7' }}>
          <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-6 ${isKeyboardOpen ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
            <Logo />
            <div className={isKeyboardOpen ? 'space-y-1' : 'space-y-2'}>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Nueva contraseña
              </CardTitle>
              {!isKeyboardOpen && (
                <p className="text-sm sm:text-base text-gray-600">
                  Ingresa tu nueva contraseña segura
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardOpen ? 'space-y-4' : 'space-y-5 sm:space-y-6'}`}>
            <form onSubmit={handleSubmit} className={isKeyboardOpen ? 'space-y-4' : 'space-y-5'}>
              <PasswordField
                id="newPassword"
                label="Nueva contraseña"
                placeholder="Ingresa tu nueva contraseña"
                value={passwordData.newPassword}
                showPassword={showPasswords.newPassword}
                onChange={(value) => handlePasswordChange('newPassword', value)}
                onToggleVisibility={() => togglePasswordVisibility('newPassword')}
                error={errors.newPassword}
                showStrength={true}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirmar nueva contraseña"
                placeholder="Confirma tu nueva contraseña"
                value={passwordData.confirmPassword}
                showPassword={showPasswords.confirmPassword}
                onChange={(value) => handlePasswordChange('confirmPassword', value)}
                onToggleVisibility={() => togglePasswordVisibility('confirmPassword')}
                error={errors.confirmPassword}
              />

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Actualizando contraseña..." : "Actualizar contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 