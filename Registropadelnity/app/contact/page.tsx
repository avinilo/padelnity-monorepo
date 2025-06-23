"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Mail, Phone, MapPin, Copy, CheckCircle, ExternalLink, MessageCircle } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Hooks
import { useToast } from "@/hooks/useToast"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// Types
interface ContactState {
  isEmailCopied: boolean
  isPhoneCopied: boolean
  lastAction: 'email' | 'phone' | 'copy' | 'location' | null
}

interface ContactMethod {
  id: string
  icon: React.ComponentType<any>
  label: string
  value: string
  action: string
  description: string
  primary?: boolean
}

// Constants
const CONTACT_CONFIG = {
  email: "support@padelnity.com",
  phone: "+34 900 123 456",
  address: "Madrid, España",
  businessHours: "Lun-Vie 9:00-18:00",
  responseTime: "24 horas",
  copySuccessTime: 3000, // milliseconds
  methods: [
    {
      id: 'email',
      icon: Mail,
      label: 'Email de soporte',
      value: 'support@padelnity.com',
      action: 'Enviar correo',
      description: 'Respuesta en 24h',
      primary: true
    },
    {
      id: 'phone',
      icon: Phone,
      label: 'Teléfono de soporte',
      value: '+34 900 123 456',
      action: 'Llamar ahora',
      description: 'Lun-Vie 9:00-18:00'
    },
    {
      id: 'location',
      icon: MapPin,
      label: 'Ubicación',
      value: 'Madrid, España',
      action: 'Ver ubicación',
      description: 'Oficinas centrales'
    }
  ] as ContactMethod[]
} as const



// Contact actions hook
const useContactActions = () => {
  const [state, setState] = useState<ContactState>({
    isEmailCopied: false,
    isPhoneCopied: false,
    lastAction: null
  })
  
  const { toast } = useToast()

  const resetCopyState = useCallback((type: 'email' | 'phone') => {
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        [`is${type.charAt(0).toUpperCase() + type.slice(1)}Copied`]: false
      }))
    }, CONTACT_CONFIG.copySuccessTime)
  }, [])

  const copyToClipboard = useCallback(async (text: string, type: 'email' | 'phone') => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setState(prev => ({
          ...prev,
          [`is${type.charAt(0).toUpperCase() + type.slice(1)}Copied`]: true,
          lastAction: 'copy'
        }))
        // Copiado - silencioso
        resetCopyState(type)
      } else {
        // Fallback para navegadores sin clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setState(prev => ({
          ...prev,
          [`is${type.charAt(0).toUpperCase() + type.slice(1)}Copied`]: true,
          lastAction: 'copy'
        }))
        // Copiado - silencioso
        resetCopyState(type)
      }
    } catch {
      // Error silencioso al copiar
      toast.error("Error al copiar", "Inténtalo de nuevo")
    }
  }, [toast, resetCopyState])

  const handleEmailAction = useCallback(async () => {
    setState(prev => ({ ...prev, lastAction: 'email' }))
    
    try {
      // Intentar abrir cliente de email
      const emailUrl = `mailto:${CONTACT_CONFIG.email}?subject=Soporte Padelnity&body=Hola, necesito ayuda con...`
      window.location.href = emailUrl
      
      // Mostrar opción de copia como backup
      setTimeout(() => {
        // Email enviado - silencioso
      }, 2000)
      
    } catch {
      // Error silencioso al abrir email
      await copyToClipboard(CONTACT_CONFIG.email, 'email')
    }
  }, [copyToClipboard])

  const handlePhoneAction = useCallback(async () => {
    setState(prev => ({ ...prev, lastAction: 'phone' }))
    
    try {
      window.location.href = `tel:${CONTACT_CONFIG.phone}`
    } catch {
      // Error silencioso al abrir teléfono
      await copyToClipboard(CONTACT_CONFIG.phone, 'phone')
    }
  }, [copyToClipboard])

  const handleLocationAction = useCallback(() => {
    setState(prev => ({ ...prev, lastAction: 'location' }))
    
    // Abrir Google Maps
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_CONFIG.address)}`
    window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    
    toast.info("Ubicación abierta", "Se ha abierto Google Maps en una nueva pestaña")
  }, [toast])

  return {
    state,
    actions: {
      handleEmailAction,
      handlePhoneAction,
      handleLocationAction,
      copyEmail: () => copyToClipboard(CONTACT_CONFIG.email, 'email'),
      copyPhone: () => copyToClipboard(CONTACT_CONFIG.phone, 'phone')
    }
  }
}

// Memoized components
const ContactMethodCard = memo(({ 
  method, 
  onAction, 
  onCopy, 
  isCopied, 
  isKeyboardOpen 
}: {
  method: ContactMethod
  onAction: () => void
  onCopy?: () => void
  isCopied?: boolean
  isKeyboardOpen: boolean
}) => {
  const IconComponent = method.icon
  
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 hover:bg-emerald-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-emerald-900 mb-1">
              {method.label}
            </p>
            <button 
              onClick={onAction}
              className="text-sm sm:text-base text-emerald-700 font-semibold hover:text-emerald-800 text-left break-all focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
              aria-label={`${method.action}: ${method.value}`}
            >
              {method.value}
            </button>
            {!isKeyboardOpen && (
              <p className="text-xs text-emerald-600 mt-1">
                {method.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Copy button for email and phone */}
        {onCopy && (
          <button
            onClick={onCopy}
            className="ml-2 p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={`Copiar ${method.label.toLowerCase()}`}
            title={`Copiar ${method.label.toLowerCase()}`}
          >
            {isCopied ? (
              <CheckCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
        
        {/* External link icon for location */}
        {method.id === 'location' && (
          <ExternalLink className="w-4 h-4 text-emerald-600 ml-2 flex-shrink-0" aria-hidden="true" />
        )}
      </div>
    </div>
  )
})

ContactMethodCard.displayName = 'ContactMethodCard'

const QuickActions = memo(({ 
  onEmailAction, 
  onPhoneAction, 
  isKeyboardOpen 
}: {
  onEmailAction: () => void
  onPhoneAction: () => void
  isKeyboardOpen: boolean
}) => {
  if (isKeyboardOpen) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        onClick={onEmailAction}
        className="h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm sm:text-base font-semibold active:scale-95 transition-transform"
        aria-label="Enviar correo electrónico de soporte"
      >
        <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
        Email
      </Button>
      
      <Button 
        onClick={onPhoneAction}
        variant="outline"
        className="h-12 sm:h-14 border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm sm:text-base font-semibold active:scale-95 transition-transform"
        aria-label="Llamar al teléfono de soporte"
      >
        <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
        Llamar
      </Button>
    </div>
  )
})

QuickActions.displayName = 'QuickActions'

const SupportInfo = memo(({ isKeyboardOpen }: { isKeyboardOpen: boolean }) => {
  if (isKeyboardOpen) return null

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4">
      <div className="flex items-start">
        <MessageCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div>
          <h4 className="font-semibold text-emerald-900 text-xs sm:text-sm mb-1">
            Información de soporte
          </h4>
          <ul className="text-emerald-800 text-xs space-y-1">
            <li>• Tiempo de respuesta: {CONTACT_CONFIG.responseTime}</li>
            <li>• Horario: {CONTACT_CONFIG.businessHours}</li>
            <li>• Soporte en español</li>
          </ul>
        </div>
      </div>
    </div>
  )
})

SupportInfo.displayName = 'SupportInfo'

const NavigationLinks = memo(({ isKeyboardOpen }: { isKeyboardOpen: boolean }) => {
  if (isKeyboardOpen) return null

  return (
    <div className="mt-4 sm:mt-6 text-center space-y-2">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm sm:text-base text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Volver al inicio
      </Link>
      
      <div className="text-xs sm:text-sm text-white/90">
        ¿Problemas técnicos?{" "}
        <Link
          href="/help"
          className="font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
        >
          Centro de ayuda
        </Link>
      </div>
    </div>
  )
})

NavigationLinks.displayName = 'NavigationLinks'

// Main component
export default function ContactPage() {
  // Hooks
  const isKeyboardOpen = useKeyboardDetection()
  const { state, actions } = useContactActions()

  // Computed values
  const contactMethods = useMemo(() => CONTACT_CONFIG.methods, [])
  
  const primaryMethod = useMemo(() => 
    contactMethods.find(method => method.primary), 
    [contactMethods]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center py-4 px-3 sm:py-6 sm:px-4">
      {/* Background effects - responsive sizes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <Card className="shadow-xl bg-white/95 backdrop-blur rounded-lg sm:rounded-xl">
          <CardHeader className={`text-center pt-6 pb-4 sm:pt-8 sm:pb-6 ${isKeyboardOpen ? 'space-y-3' : 'space-y-4 sm:space-y-6'}`}>
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
                Contacto
              </CardTitle>
              {!isKeyboardOpen && (
                <p className="text-sm sm:text-base text-gray-600">
                  ¿Necesitas ayuda? Estamos aquí para ti
                </p>
              )}
            </div>
          </CardHeader>
          
          <CardContent className={`px-4 pb-6 sm:px-6 sm:pb-8 ${isKeyboardOpen ? 'space-y-4' : 'space-y-5 sm:space-y-6'}`}>
            {/* Contact methods */}
            <div className="space-y-3 sm:space-y-4">
              {contactMethods.map((method) => (
                <ContactMethodCard
                  key={method.id}
                  method={method}
                  onAction={
                    method.id === 'email' ? actions.handleEmailAction :
                    method.id === 'phone' ? actions.handlePhoneAction :
                    actions.handleLocationAction
                  }
                  onCopy={
                    method.id === 'email' ? actions.copyEmail :
                    method.id === 'phone' ? actions.copyPhone :
                    undefined
                  }
                  isCopied={
                    method.id === 'email' ? state.isEmailCopied :
                    method.id === 'phone' ? state.isPhoneCopied :
                    false
                  }
                  isKeyboardOpen={isKeyboardOpen}
                />
              ))}
            </div>

            {/* Quick action buttons */}
            <QuickActions 
              onEmailAction={actions.handleEmailAction}
              onPhoneAction={actions.handlePhoneAction}
              isKeyboardOpen={isKeyboardOpen}
            />

            {/* Support information */}
            <SupportInfo isKeyboardOpen={isKeyboardOpen} />
          </CardContent>
        </Card>

        {/* Navigation links */}
        <NavigationLinks isKeyboardOpen={isKeyboardOpen} />
      </div>
    </div>
  )
} 