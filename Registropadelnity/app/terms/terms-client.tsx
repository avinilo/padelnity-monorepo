'use client'

import Link from "next/link"
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Scale, Edit, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useMemo, useCallback, useState, useEffect } from "react"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// TypeScript Interfaces
interface TermsSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

interface TermsConfig {
  lastUpdated: string
  contactEmail: string
  minAge: number
  companyName: string
}

// Centralized Configuration
const TERMS_CONFIG: TermsConfig = {
  lastUpdated: new Date().toLocaleDateString('es-ES'),
  contactEmail: 'legal@padelnity.com',
  minAge: 16,
  companyName: 'Padelnity'
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
const TermsHeader = memo(() => (
  <CardHeader className="text-center pb-6">
    <div className="flex items-center justify-center mb-4">
      <div className="p-3 bg-emerald-100 rounded-full">
        <FileText className="h-8 w-8 text-emerald-600" />
      </div>
    </div>
    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
      Términos y Condiciones
    </CardTitle>
    <p className="text-gray-600 mt-2 text-sm sm:text-base">
      Última actualización: {TERMS_CONFIG.lastUpdated}
    </p>
  </CardHeader>
))

TermsHeader.displayName = 'TermsHeader'

const AcceptanceSection = memo(() => (
  <section id="acceptance" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Shield className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">1. Aceptación de los Términos</h3>
    </div>
    <p className="leading-relaxed text-base">
      Al acceder y utilizar {TERMS_CONFIG.companyName}, aceptas estar sujeto a estos términos y condiciones de uso. 
      Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
    </p>
  </section>
))

AcceptanceSection.displayName = 'AcceptanceSection'

const ServiceDescriptionSection = memo(() => (
  <section id="service-description" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Users className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">2. Descripción del Servicio</h3>
    </div>
    <p className="leading-relaxed text-base">
      {TERMS_CONFIG.companyName} es una plataforma digital que permite a los usuarios organizar, participar y gestionar 
      torneos de pádel. Facilitamos la conexión entre jugadores y la organización de eventos deportivos.
    </p>
  </section>
))

ServiceDescriptionSection.displayName = 'ServiceDescriptionSection'

const UserRegistrationSection = memo(() => (
  <section id="user-registration" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <FileText className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">3. Registro de Usuario</h3>
    </div>
    <p className="leading-relaxed mb-4 text-base">
      Para utilizar nuestros servicios, debes:
    </p>
    <ul className="list-disc list-inside space-y-3 ml-4 text-base">
      <li>Proporcionar información veraz y actualizada</li>
      <li>Mantener la confidencialidad de tu cuenta</li>
      <li>Ser mayor de {TERMS_CONFIG.minAge} años o tener autorización parental</li>
      <li>No crear múltiples cuentas</li>
    </ul>
  </section>
))

UserRegistrationSection.displayName = 'UserRegistrationSection'

const AcceptableUseSection = memo(() => (
  <section id="acceptable-use" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <AlertTriangle className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">4. Uso Aceptable</h3>
    </div>
    <p className="leading-relaxed mb-4 text-base">
      Te comprometes a no utilizar el servicio para:
    </p>
    <ul className="list-disc list-inside space-y-3 ml-4 text-base">
      <li>Actividades ilegales o fraudulentas</li>
      <li>Hostigamiento o comportamiento abusivo</li>
      <li>Spam o contenido no solicitado</li>
      <li>Violación de derechos de propiedad intelectual</li>
    </ul>
    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <p className="text-emerald-800 font-medium text-base">
        <strong>Importante:</strong> El incumplimiento de estas normas puede resultar en la suspensión o cancelación de tu cuenta.
      </p>
    </div>
  </section>
))

AcceptableUseSection.displayName = 'AcceptableUseSection'

const PrivacyDataSection = memo(() => (
  <section id="privacy-data" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Shield className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">5. Privacidad y Datos</h3>
    </div>
    <p className="leading-relaxed text-base">
      El tratamiento de tus datos personales se rige por nuestra{' '}
      <Link 
        href="/privacy" 
        className="font-medium text-emerald-600 hover:text-emerald-700 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded transition-colors"
      >
        Política de Privacidad
      </Link>
      , que forma parte integral de estos términos.
    </p>
  </section>
))

PrivacyDataSection.displayName = 'PrivacyDataSection'

const ResponsibilitySection = memo(() => (
  <section id="responsibility" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Scale className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">6. Responsabilidad</h3>
    </div>
    <p className="leading-relaxed text-base">
      {TERMS_CONFIG.companyName} actúa como intermediario. No somos responsables de disputas entre usuarios, 
      lesiones durante los eventos, o problemas derivados del uso de instalaciones deportivas.
    </p>
  </section>
))

ResponsibilitySection.displayName = 'ResponsibilitySection'

const ModificationsSection = memo(() => (
  <section id="modifications" className="scroll-mt-4">
    <div className="flex items-center mb-4">
      <Edit className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">7. Modificaciones</h3>
    </div>
    <p className="leading-relaxed text-base">
      Nos reservamos el derecho de modificar estos términos en cualquier momento. 
      Los cambios serán notificados a través de la plataforma con al menos 30 días de antelación.
    </p>
  </section>
))

ModificationsSection.displayName = 'ModificationsSection'

const ContactSection = memo(() => {
  const handleEmailClick = useCallback((email: string) => {
    window.location.href = `mailto:${email}`
  }, [])

  return (
    <section id="contact" className="scroll-mt-4">
      <div className="flex items-center mb-4">
        <Mail className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">8. Contacto</h3>
      </div>
      <p className="leading-relaxed text-base">
        Para cualquier consulta sobre estos términos, puedes contactarnos en:{' '}
        <button
          onClick={() => handleEmailClick(TERMS_CONFIG.contactEmail)}
          className="font-medium text-emerald-600 hover:text-emerald-700 underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded transition-colors"
          aria-label={`Enviar email a ${TERMS_CONFIG.contactEmail}`}
        >
          {TERMS_CONFIG.contactEmail}
        </button>
      </p>
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
export default function TermsPageClient() {
  const isKeyboardVisible = useKeyboardDetection()
  const scrollToSection = useScrollToSection()

  // Memoized sections array
  const termsSections = useMemo(() => [
    AcceptanceSection,
    ServiceDescriptionSection,
    UserRegistrationSection,
    AcceptableUseSection,
    PrivacyDataSection,
    ResponsibilitySection,
    ModificationsSection,
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
          <TermsHeader />

          <CardContent className={contentClasses}>
            {termsSections.map((SectionComponent, index) => (
              <SectionComponent key={index} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 