"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"
import { useOnboarding } from "@/hooks/useOnboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, CheckCircle, ArrowLeft, Star } from "lucide-react"

// Background Pattern Component
const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -inset-10 opacity-50">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </div>
  </div>
)

// Logo Component
const Logo = () => (
  <div className="flex justify-center mb-6">
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

// Screen Container Component
const ScreenContainer = ({ children }: { children: React.ReactNode }) => {
  const { isKeyboardVisible } = useKeyboardDetection()
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 py-6 sm:py-12 px-3 sm:px-4 ${isKeyboardVisible ? 'pb-2' : ''}`}>
      <BackgroundPattern />
      <div className="relative w-full max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  )
}

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  period: string
  features: string[]
  popular?: boolean
  colorScheme: 'gray' | 'emerald' | 'blue'
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 19,
    currency: '€',
    period: 'mes',
    colorScheme: 'gray',
    features: [
      'Hasta 2 pistas',
      'Gestión básica de reservas',
      'Soporte por email',
      'Panel de control básico'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39,
    currency: '€',
    period: 'mes',
    colorScheme: 'emerald',
    popular: true,
    features: [
      'Hasta 10 pistas',
      'Gestión avanzada de reservas',
      'Organización de torneos',
      'Soporte prioritario',
      'Estadísticas detalladas',
      'Integración con redes sociales'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 69,
    currency: '€',
    period: 'mes',
    colorScheme: 'blue',
    features: [
      'Pistas ilimitadas',
      'Todas las funcionalidades Pro',
      'API personalizada',
      'Soporte 24/7',
      'Manager dedicado',
      'Personalización completa'
    ]
  }
]

// Plan Card Component
interface PlanCardProps {
  plan: Plan
  isSelected: boolean
  isLoading: boolean
  onSelect: () => void
}

const PlanCard = ({ plan, isSelected, isLoading, onSelect }: PlanCardProps) => {
  const colors = {
    gray: {
      gradient: 'from-gray-500 to-gray-600',
      hoverGradient: 'hover:from-gray-600 hover:to-gray-700',
      checkColor: 'text-gray-500',
      ringColor: 'ring-gray-200'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700',
      checkColor: 'text-emerald-500',
      ringColor: 'ring-emerald-200'
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      checkColor: 'text-blue-500',
      ringColor: 'ring-blue-200'
    }
  }
  
  const color = colors[plan.colorScheme]
  
  return (
    <Card className={`relative shadow-xl bg-white/95 backdrop-blur transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${plan.popular ? `ring-2 ${color.ringColor}` : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`bg-gradient-to-r ${color.gradient} text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center shadow-lg`}>
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Más Popular
          </div>
        </div>
      )}

      <CardContent className="p-6 sm:p-8">
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {plan.name}
          </h3>
          <div className="mb-6">
            <span className="text-3xl sm:text-4xl font-bold text-gray-900">
              {plan.currency}{plan.price}
            </span>
            <span className="text-gray-600 ml-1 text-sm sm:text-base">/{plan.period}</span>
          </div>
        </div>

        <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm sm:text-base">
              <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 mr-2 sm:mr-3 flex-shrink-0 ${color.checkColor}`} />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] ${
            isSelected
              ? 'bg-gray-400 cursor-not-allowed'
              : `bg-gradient-to-r ${color.gradient} ${color.hoverGradient} text-white`
          }`}
        >
          {isSelected ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Seleccionado...
            </div>
          ) : isLoading ? (
            'Procesando...'
          ) : (
            'Seleccionar plan'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SelectPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuth()
  const { success, error } = useToast()
  const router = useRouter()
  const { isKeyboardVisible } = useKeyboardDetection()
  const { refreshStatus } = useOnboarding()

  const handleSelectPlan = async (planId: string) => {
    try {
      setLoading(true)
      setSelectedPlan(planId)
      
      // Por ahora solo completamos el onboarding
      // En el futuro aquí integraremos con Stripe
      const { error: updateError } = await updateProfile({
        onboarding_complete: true,
      })
      
      if (updateError) {
        throw updateError
      }

      success(`Plan ${plans.find(p => p.id === planId)?.name} seleccionado`)
      
      // Actualizar estado y redirigir (solución para problema de sincronización)
      await refreshStatus()
      
      // Simular delay para mejor UX
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err) {
      console.error('Error seleccionando plan:', err)
      error('Error al seleccionar el plan. Inténtalo de nuevo.')
      setSelectedPlan(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenContainer>
      <div className="space-y-6 sm:space-y-8">
        <Logo />
        
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-4">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Elige tu plan perfecto
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
            Selecciona el plan que mejor se adapte a las necesidades de tu club
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              isLoading={loading}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

        {!isKeyboardVisible && (
          <div className="text-center space-y-4">
            <Link 
              href="/onboarding/club-setup" 
              className="inline-flex items-center text-white hover:text-white/90 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver a configuración del club
            </Link>
            
            <div className="space-y-2">
              <p className="text-white/80 text-sm">
                ¿Necesitas algo diferente?{" "}
                <Link
                  href="/help"
                  className="font-semibold text-white underline hover:text-white/90 hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                >
                  Contacta con nuestro equipo
                </Link>
              </p>
              
              <p className="text-white/70 text-xs">
                Todos los planes incluyen prueba gratuita de 14 días. Sin compromiso.
              </p>
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  )
} 