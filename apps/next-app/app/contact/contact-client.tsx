'use client'

import Link from "next/link"
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, MapPin, Send, Loader2, CheckCircle, Users, Headphones, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { memo, useState, useCallback } from "react"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// Configuration
const CONTACT_CONFIG = {
  supportEmail: 'support@padelnity.com',
  salesEmail: 'sales@padelnity.com',
  legalEmail: 'legal@padelnity.com',
  phone: '+34 900 123 456',
  address: 'Madrid, España',
  businessHours: 'Lunes a Viernes, 9:00 - 18:00',
  emergencyResponse: '24 horas máximo'
} as const

// Contact Methods Data
const CONTACT_METHODS = [
  {
    id: 'email',
    title: 'Email de Soporte',
    description: 'Para consultas técnicas y problemas de la plataforma',
    icon: Mail,
    action: 'support@padelnity.com',
    availability: 'Respuesta en 24h'
  },
  {
    id: 'phone',
    title: 'Teléfono',
    description: 'Para asistencia inmediata y consultas urgentes',
    icon: Phone,
    action: '+34 900 123 456',
    availability: 'L-V: 9:00-18:00'
  },
  {
    id: 'chat',
    title: 'Chat en Vivo',
    description: 'Chatea con nuestro asistente inteligente',
    icon: MessageCircle,
    action: '/help',
    availability: 'Disponible 24/7'
  }
] as const

// Support Categories Data
const SUPPORT_CATEGORIES = [
  {
    id: 'technical',
    title: 'Soporte Técnico',
    description: 'Problemas con la app, bugs y funcionalidades',
    icon: Headphones,
    email: 'support@padelnity.com'
  },
  {
    id: 'sales',
    title: 'Consultas Comerciales',
    description: 'Información sobre planes y suscripciones',
    icon: CreditCard,
    email: 'sales@padelnity.com'
  },
  {
    id: 'partnerships',
    title: 'Alianzas y Clubes',
    description: 'Colaboraciones y asociaciones con clubes',
    icon: Users,
    email: 'partnerships@padelnity.com'
  }
] as const

// Form Hook
const useContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after success message
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }, [])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  return {
    formData,
    isSubmitting,
    isSubmitted,
    handleSubmit,
    handleInputChange
  }
}

// Optimized Components
const ContactHeader = memo(() => (
  <div className="text-center mb-12">
    <div className="flex items-center justify-center mb-6">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg">
        <Mail className="h-10 w-10 text-white" />
      </div>
    </div>
    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
      Contacta con Nosotros
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
      Estamos aquí para ayudarte. Elige la mejor forma de contactarnos según tus necesidades
    </p>
  </div>
))

ContactHeader.displayName = 'ContactHeader'

const ContactMethods = memo(() => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
      Métodos de Contacto
    </h2>
    <div className="grid md:grid-cols-3 gap-6">
      {CONTACT_METHODS.map((method) => {
        const IconComponent = method.icon
        const isLink = method.action.startsWith('/')
        const isEmail = method.action.includes('@')
        const isPhone = method.action.startsWith('+')
        
        const handleAction = () => {
          if (isEmail) {
            window.location.href = `mailto:${method.action}`
          } else if (isPhone) {
            window.location.href = `tel:${method.action}`
          }
        }
        
        return (
          <Card key={method.id} className="border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <IconComponent className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{method.description}</p>
              <div className="space-y-2">
                {isLink ? (
                  <Link href={method.action} className="w-full">
                    <Button variant="outline" className="w-full">
                      {method.action === '/help' ? 'Abrir Chat' : method.action}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleAction}
                  >
                    {method.action}
                  </Button>
                )}
                <p className="text-xs text-gray-500">{method.availability}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  </div>
))

ContactMethods.displayName = 'ContactMethods'

const SupportCategories = memo(() => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
      Departamentos Especializados
    </h2>
    <div className="grid md:grid-cols-3 gap-6">
      {SUPPORT_CATEGORIES.map((category) => {
        const IconComponent = category.icon
        return (
          <Card key={category.id} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <IconComponent className="h-6 w-6 text-emerald-600 mr-3" />
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = `mailto:${category.email}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                {category.email}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  </div>
))

SupportCategories.displayName = 'SupportCategories'

const ContactForm = memo(() => {
  const { formData, isSubmitting, isSubmitted, handleSubmit, handleInputChange } = useContactForm()

  if (isSubmitted) {
    return (
      <Card className="border border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">
            ¡Mensaje Enviado!
          </h3>
          <p className="text-green-800">
            Hemos recibido tu mensaje. Te responderemos en las próximas 24 horas.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900">Envíanos un Mensaje</CardTitle>
        <p className="text-gray-600">
          ¿Tienes una consulta específica? Completa el formulario y te responderemos pronto.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="tu@email.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="¿En qué podemos ayudarte?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
              disabled={isSubmitting}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              placeholder="Describe tu consulta o problema en detalle..."
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
})

ContactForm.displayName = 'ContactForm'

const ContactInfo = memo(() => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
      Información de Contacto
    </h2>
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-emerald-600 mr-3" />
            <h3 className="font-semibold text-gray-900">Horarios de Atención</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">Soporte General</p>
              <p className="text-gray-600">{CONTACT_CONFIG.businessHours}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Emergencias</p>
              <p className="text-gray-600">Respuesta en {CONTACT_CONFIG.emergencyResponse}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-6 w-6 text-emerald-600 mr-3" />
            <h3 className="font-semibold text-gray-900">Ubicación</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">Oficinas Centrales</p>
              <p className="text-gray-600">{CONTACT_CONFIG.address}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Teléfono Principal</p>
              <p className="text-gray-600">{CONTACT_CONFIG.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
))

ContactInfo.displayName = 'ContactInfo'

const NavigationLinks = memo(({ isKeyboardVisible }: { isKeyboardVisible: boolean }) => {
  if (isKeyboardVisible) return null

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Link href="/" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Inicio
        </Button>
      </Link>
      
      <Link href="/help" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <MessageCircle className="w-4 h-4 mr-2" />
          Centro de Ayuda
        </Button>
      </Link>
      
      <Link href="/terms" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          Términos y Condiciones
        </Button>
      </Link>
    </div>
  )
})

NavigationLinks.displayName = 'NavigationLinks'

// Main Optimized Component
export default function ContactPageClient() {
  const { isKeyboardVisible } = useKeyboardDetection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ContactHeader />
        
        <div className="space-y-12">
          <ContactMethods />
          <SupportCategories />
          <ContactInfo />
          
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>

        <NavigationLinks isKeyboardVisible={isKeyboardVisible} />
      </div>
    </div>
  )
} 