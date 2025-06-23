'use client'

import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Clock, Baby, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useMemo, useCallback, useState, useEffect } from "react"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// TypeScript Interfaces
interface PrivacySection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

interface PrivacyConfig {
  lastUpdated: string
  contactEmail: string
  dpoEmail: string
  minAge: number
}

// Centralized Configuration
const PRIVACY_CONFIG: PrivacyConfig = {
  lastUpdated: new Date().toLocaleDateString('es-ES'),
  contactEmail: 'privacy@padelnity.com',
  dpoEmail: 'dpo@padelnity.com',
  minAge: 16
}

// Custom Hooks
const useScrollToSection = () => {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return scrollToSection
}

// Memoized Components
const PrivacyHeader = memo(() => (
  <CardHeader className="text-center pb-6">
    <div className="flex items-center justify-center mb-4">
      <div className="p-3 bg-emerald-100 rounded-full">
        <Shield className="h-8 w-8 text-emerald-600" />
      </div>
    </div>
    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
      Política de Privacidad
    </CardTitle>
    <p className="text-gray-600 mt-2 text-sm sm:text-base">
      Última actualización: {PRIVACY_CONFIG.lastUpdated}
    </p>
  </CardHeader>
))

PrivacyHeader.displayName = 'PrivacyHeader'

const DataCollectionSection = memo(() => (
  <section id="data-collection" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Eye className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">1. Información que Recopilamos</h3>
    </div>
    <p className="leading-relaxed mb-4 text-base">
      Recopilamos la siguiente información:
    </p>
    <ul className="list-disc list-inside space-y-3 ml-4 text-base">
      <li><strong>Datos de registro:</strong> nombre, email, teléfono</li>
      <li><strong>Datos de perfil:</strong> nivel de juego, preferencias</li>
      <li><strong>Datos de uso:</strong> actividad en la plataforma</li>
      <li><strong>Datos técnicos:</strong> IP, dispositivo, navegador</li>
    </ul>
  </section>
))

DataCollectionSection.displayName = 'DataCollectionSection'

const DataUsageSection = memo(() => (
  <section id="data-usage" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Lock className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">2. Cómo Utilizamos tu Información</h3>
    </div>
    <p className="leading-relaxed mb-4 text-base">
      Utilizamos tus datos para:
    </p>
    <ul className="list-disc list-inside space-y-3 ml-4 text-base">
      <li>Proporcionar y mejorar nuestros servicios</li>
      <li>Facilitar la organización de torneos</li>
      <li>Comunicarnos contigo sobre eventos y actualizaciones</li>
      <li>Personalizar tu experiencia</li>
      <li>Garantizar la seguridad de la plataforma</li>
    </ul>
  </section>
))

DataUsageSection.displayName = 'DataUsageSection'

const DataSharingSection = memo(() => (
  <section id="data-sharing" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Users className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">3. Compartir Información</h3>
    </div>
    <p className="leading-relaxed mb-4 text-base">
      Compartimos tu información únicamente:
    </p>
    <ul className="list-disc list-inside space-y-3 ml-4 text-base">
      <li>Con otros usuarios para facilitar los torneos</li>
      <li>Con proveedores de servicios de confianza</li>
      <li>Cuando sea requerido por ley</li>
      <li>Con tu consentimiento explícito</li>
    </ul>
    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <p className="text-emerald-800 font-medium text-base">
        <strong>Nunca vendemos</strong> tus datos personales a terceros.
      </p>
    </div>
  </section>
))

DataSharingSection.displayName = 'DataSharingSection'

const DataSecuritySection = memo(() => (
  <section id="data-security" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Shield className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">4. Seguridad de los Datos</h3>
    </div>
    <p className="leading-relaxed text-base">
      Implementamos medidas de seguridad técnicas y organizativas para proteger 
      tus datos personales contra acceso no autorizado, alteración, divulgación o destrucción.
    </p>
  </section>
))

DataSecuritySection.displayName = 'DataSecuritySection'

const UserRightsSection = memo(() => (
  <section id="user-rights" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <FileText className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">5. Tus Derechos</h3>
    </div>
    <p className="leading-relaxed mb-4 text-base">
      Tienes derecho a:
    </p>
    <ul className="list-disc list-inside space-y-3 ml-4 text-base">
      <li>Acceder a tus datos personales</li>
      <li>Rectificar información incorrecta</li>
      <li>Solicitar la eliminación de tus datos</li>
      <li>Limitar el procesamiento</li>
      <li>Portabilidad de datos</li>
      <li>Oponerte al procesamiento</li>
    </ul>
  </section>
))

UserRightsSection.displayName = 'UserRightsSection'

const CookiesSection = memo(() => (
  <section id="cookies" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Eye className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">6. Cookies y Tecnologías Similares</h3>
    </div>
    <p className="leading-relaxed text-base">
      Utilizamos cookies para mejorar tu experiencia, analizar el uso de la plataforma 
      y personalizar el contenido. Puedes gestionar las cookies desde tu navegador.
    </p>
  </section>
))

CookiesSection.displayName = 'CookiesSection'

const DataRetentionSection = memo(() => (
  <section id="data-retention" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Clock className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">7. Retención de Datos</h3>
    </div>
    <p className="leading-relaxed text-base">
      Conservamos tus datos personales solo durante el tiempo necesario para cumplir 
      con los fines para los que fueron recopilados o según lo requiera la ley.
    </p>
  </section>
))

DataRetentionSection.displayName = 'DataRetentionSection'

const MinorsSection = memo(() => (
  <section id="minors" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Baby className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">8. Menores de Edad</h3>
    </div>
    <p className="leading-relaxed text-base">
      Nuestros servicios están dirigidos a personas mayores de {PRIVACY_CONFIG.minAge} años. 
      Los menores requieren autorización parental para usar la plataforma.
    </p>
  </section>
))

MinorsSection.displayName = 'MinorsSection'

const ContactSection = memo(() => {
  const handleEmailClick = useCallback((email: string) => {
    window.location.href = `mailto:${email}`
  }, [])

  return (
    <section id="contact" className="scroll-mt-4">
      <div className="flex items-center mb-4">
        <Mail className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">9. Contacto</h3>
      </div>
      <div className="space-y-4">
        <p className="leading-relaxed text-base">
          Para ejercer tus derechos o consultas sobre privacidad, contacta:{' '}
          <button
            onClick={() => handleEmailClick(PRIVACY_CONFIG.contactEmail)}
            className="font-medium text-emerald-600 hover:text-emerald-700 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded transition-colors"
            aria-label={`Enviar email a ${PRIVACY_CONFIG.contactEmail}`}
          >
            {PRIVACY_CONFIG.contactEmail}
          </button>
        </p>
        <p className="leading-relaxed text-base">
          Delegado de Protección de Datos:{' '}
          <button
            onClick={() => handleEmailClick(PRIVACY_CONFIG.dpoEmail)}
            className="font-medium text-emerald-600 hover:text-emerald-700 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded transition-colors"
            aria-label={`Enviar email a ${PRIVACY_CONFIG.dpoEmail}`}
          >
            {PRIVACY_CONFIG.dpoEmail}
          </button>
        </p>
      </div>
    </section>
  )
})

ContactSection.displayName = 'ContactSection'

const NavigationButton = memo(() => (
  <div className="mb-6 text-center">
    <Link 
      href="/" 
      className="inline-flex items-center text-sm sm:text-base text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
      aria-label="Volver a la página principal"
    >
      <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
      Volver
    </Link>
  </div>
))

NavigationButton.displayName = 'NavigationButton'

// Main Client Component
export default function PrivacyPageClient() {
  const isKeyboardVisible = useKeyboardDetection()
  const scrollToSection = useScrollToSection()

  // Memoized sections array
  const privacySections = useMemo(() => [
    DataCollectionSection,
    DataUsageSection,
    DataSharingSection,
    DataSecuritySection,
    UserRightsSection,
    CookiesSection,
    DataRetentionSection,
    MinorsSection,
    ContactSection
  ], [])

  // Memoized container classes - Responsive design
  const containerClasses = useMemo(() => 
    `min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 ${
      // Mobile: full height with padding, Desktop: centered
      'sm:flex sm:items-center sm:justify-center'
    } py-4 px-3 sm:py-6 sm:px-4 ${isKeyboardVisible ? 'pb-2' : ''}`,
    [isKeyboardVisible]
  )

  const contentClasses = useMemo(() => 
    `space-y-8 text-gray-700 ${
      // Mobile: no height restriction, Desktop: controlled height with scroll
      'sm:max-h-[70vh] sm:overflow-y-auto'
    }`,
    []
  )

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-4xl">
        <NavigationButton />

        <Card className="shadow-xl border-0" style={{ backgroundColor: '#F4FAF7' }}>
          <PrivacyHeader />

          <CardContent className={contentClasses}>
            {privacySections.map((SectionComponent, index) => (
              <SectionComponent key={index} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 