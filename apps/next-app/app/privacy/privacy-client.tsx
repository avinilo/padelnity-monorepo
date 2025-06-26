'use client'

import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Clock, Baby, Mail, Globe, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useCallback } from "react"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// TypeScript Interfaces
interface PrivacyConfig {
  lastUpdated: string
  contactEmail: string
  dpoEmail: string
  minAge: number
  companyName: string
  address: string
}

// Centralized Configuration
const PRIVACY_CONFIG: PrivacyConfig = {
  lastUpdated: new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  contactEmail: 'privacy@padelnity.com',
  dpoEmail: 'dpo@padelnity.com',
  minAge: 16,
  companyName: 'Padelnity SL',
  address: 'Madrid, España'
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
  <CardHeader className="text-center pb-8 bg-gradient-to-r from-emerald-50 to-teal-50">
    <div className="flex items-center justify-center mb-6">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg">
        <Shield className="h-10 w-10 text-white" />
      </div>
    </div>
    <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
      Política de Privacidad
    </CardTitle>
    <p className="text-gray-600 text-lg">
      Tu privacidad es fundamental para nosotros
    </p>
    <p className="text-sm text-gray-500 mt-4">
      Última actualización: {PRIVACY_CONFIG.lastUpdated}
    </p>
  </CardHeader>
))

PrivacyHeader.displayName = 'PrivacyHeader'

const TableOfContents = memo(({ scrollToSection }: { scrollToSection: (id: string) => void }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
      <FileText className="h-5 w-5 text-emerald-600 mr-2" />
      Índice de Contenidos
    </h3>
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {[
        { id: 'data-collection', title: '1. Información que Recopilamos' },
        { id: 'data-usage', title: '2. Cómo Utilizamos tu Información' },
        { id: 'data-sharing', title: '3. Compartir Información' },
        { id: 'data-security', title: '4. Seguridad de los Datos' },
        { id: 'user-rights', title: '5. Tus Derechos' },
        { id: 'cookies', title: '6. Cookies y Tecnologías Similares' },
        { id: 'data-retention', title: '7. Retención de Datos' },
        { id: 'minors', title: '8. Menores de Edad' },
        { id: 'changes', title: '9. Cambios en esta Política' },
        { id: 'contact', title: '10. Contacto' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className="text-left text-sm text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 p-2 rounded transition-colors"
        >
          {item.title}
        </button>
      ))}
    </nav>
  </div>
))

TableOfContents.displayName = 'TableOfContents'

const DataCollectionSection = memo(() => (
  <section id="data-collection" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Eye className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">1. Información que Recopilamos</h3>
    </div>
    <div className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-4">
        Recopilamos diferentes tipos de información para proporcionarte la mejor experiencia en 
        <strong> {PRIVACY_CONFIG.companyName}</strong> y mejorar nuestros servicios.
      </p>
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Tipos de Datos que Recopilamos</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Datos de registro:</strong> nombre, email, teléfono, fecha de nacimiento</li>
          <li><strong>Datos de perfil deportivo:</strong> nivel de juego, posición preferida, historial de partidas</li>
          <li><strong>Datos de uso:</strong> actividad en la plataforma, estadísticas de juego, preferencias</li>
          <li><strong>Datos técnicos:</strong> dirección IP, información del dispositivo, navegador utilizado</li>
          <li><strong>Datos de comunicación:</strong> mensajes enviados, interacciones con otros usuarios</li>
          <li><strong>Datos de ubicación:</strong> localización para encontrar pistas y jugadores cercanos</li>
        </ul>
      </div>
    </div>
  </section>
))

DataCollectionSection.displayName = 'DataCollectionSection'

const DataUsageSection = memo(() => (
  <section id="data-usage" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Lock className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">2. Cómo Utilizamos tu Información</h3>
    </div>
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Finalidades del Tratamiento</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Proporcionar y gestionar tu cuenta en Padelnity</li>
          <li>Facilitar la organización de torneos y partidas</li>
          <li>Conectarte con otros jugadores de tu nivel y zona</li>
          <li>Personalizar tu experiencia en la plataforma</li>
          <li>Enviar notificaciones importantes sobre el servicio</li>
          <li>Mejorar nuestros servicios mediante análisis de uso</li>
          <li>Garantizar la seguridad de la plataforma</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
      </div>
      
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center">
          <Lock className="h-4 w-4 mr-2" />
          Base Legal del Tratamiento
        </h4>
        <p className="text-emerald-800">
          Procesamos tus datos personales basándonos en tu <strong>consentimiento</strong>, 
          la <strong>ejecución del contrato</strong> de servicios, nuestros <strong>intereses legítimos</strong> 
          para mejorar el servicio y el <strong>cumplimiento de obligaciones legales</strong>.
        </p>
      </div>
    </div>
  </section>
))

DataUsageSection.displayName = 'DataUsageSection'

const DataSharingSection = memo(() => (
  <section id="data-sharing" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Users className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">3. Compartir Información</h3>
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="border-l-4 border-red-500 pl-4">
          <h4 className="font-semibold text-red-900 mb-2">🚫 Nunca Compartimos</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Datos personales con fines comerciales</li>
            <li>• Información financiera con terceros</li>
            <li>• Mensajes privados entre usuarios</li>
            <li>• Datos sin consentimiento explícito</li>
            <li>• Información con empresas de marketing</li>
            <li>• Datos personales fuera de la UE sin garantías</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="border-l-4 border-green-500 pl-4">
          <h4 className="font-semibold text-green-900 mb-2">✅ Compartimos Solo Cuando</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Es necesario para el funcionamiento del servicio</li>
            <li>• Otros usuarios necesitan verte en torneos</li>
            <li>• Proveedores técnicos procesan datos por nosotros</li>
            <li>• La ley lo requiere expresamente</li>
            <li>• Has dado tu consentimiento específico</li>
            <li>• Es necesario para proteger derechos y seguridad</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
      <div className="flex items-center mb-3">
        <Shield className="h-5 w-5 text-emerald-600 mr-2" />
        <h4 className="font-bold text-emerald-900">Compromiso de Privacidad</h4>
      </div>
      <p className="text-emerald-800">
        <strong>Nunca vendemos</strong> tus datos personales a terceros. Tu información solo se 
        comparte cuando es estrictamente necesario para el funcionamiento del servicio o cuando 
        la ley lo requiere.
      </p>
    </div>
  </section>
))

DataSharingSection.displayName = 'DataSharingSection'

const DataSecuritySection = memo(() => (
  <section id="data-security" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Shield className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">4. Seguridad de los Datos</h3>
    </div>
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Medidas de Seguridad Implementadas</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Cifrado SSL/TLS para transmisión de datos</li>
            <li>Cifrado de base de datos</li>
            <li>Autenticación de dos factores (2FA)</li>
            <li>Control de acceso basado en roles</li>
          </ul>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Monitoreo continuo de seguridad</li>
            <li>Copias de seguridad regulares</li>
            <li>Auditorías de seguridad periódicas</li>
            <li>Capacitación del personal en privacidad</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Incidentes de Seguridad
        </h4>
        <p className="text-amber-800">
          En caso de una brecha de seguridad que afecte tus datos personales, te notificaremos 
          en un plazo máximo de <strong>72 horas</strong> y tomaremos medidas inmediatas para 
          minimizar el impacto.
        </p>
      </div>
    </div>
  </section>
))

DataSecuritySection.displayName = 'DataSecuritySection'

const UserRightsSection = memo(() => (
  <section id="user-rights" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <FileText className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">5. Tus Derechos</h3>
    </div>
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Derechos del Usuario (RGPD)</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Acceso:</strong> Solicitar copia de tus datos</li>
            <li><strong>Rectificación:</strong> Corregir datos incorrectos</li>
            <li><strong>Eliminación:</strong> Solicitar borrado de datos</li>
            <li><strong>Limitación:</strong> Restringir el procesamiento</li>
          </ul>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Portabilidad:</strong> Recibir datos en formato estándar</li>
            <li><strong>Oposición:</strong> Oponerte al procesamiento</li>
            <li><strong>Consentimiento:</strong> Retirar autorización</li>
            <li><strong>Reclamación:</strong> Presentar queja ante autoridad</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h4 className="font-semibold text-emerald-900 mb-3">¿Cómo Ejercer tus Derechos?</h4>
        <p className="text-emerald-800 mb-2">
          Puedes ejercer cualquiera de estos derechos contactándonos en:
        </p>
        <p className="text-emerald-700 font-medium">{PRIVACY_CONFIG.contactEmail}</p>
        <p className="text-emerald-800 text-sm mt-2">
          Responderemos a tu solicitud en un plazo máximo de <strong>30 días</strong>.
        </p>
      </div>
    </div>
  </section>
))

UserRightsSection.displayName = 'UserRightsSection'

const CookiesSection = memo(() => (
  <section id="cookies" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Eye className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">6. Cookies y Tecnologías Similares</h3>
    </div>
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Tipos de Cookies que Utilizamos</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-emerald-200 rounded p-3">
            <h5 className="font-semibold text-emerald-700 mb-2">Esenciales</h5>
            <p className="text-sm text-gray-700">Necesarias para el funcionamiento básico</p>
          </div>
          <div className="border border-emerald-200 rounded p-3">
            <h5 className="font-semibold text-emerald-700 mb-2">Funcionales</h5>
            <p className="text-sm text-gray-700">Mejoran la experiencia del usuario</p>
          </div>
          <div className="border border-emerald-200 rounded p-3">
            <h5 className="font-semibold text-emerald-700 mb-2">Analíticas</h5>
            <p className="text-sm text-gray-700">Nos ayudan a entender el uso de la plataforma</p>
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed">
        Puedes gestionar las cookies desde la configuración de tu navegador. Ten en cuenta que 
        deshabilitar ciertas cookies puede afectar la funcionalidad de la plataforma.
      </p>
    </div>
  </section>
))

CookiesSection.displayName = 'CookiesSection'

const MinorsSection = memo(() => (
  <section id="minors" className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Baby className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">8. Menores de Edad</h3>
    </div>
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
          <Baby className="h-4 w-4 mr-2" />
          Protección de Menores
        </h4>
        <p className="text-amber-800 mb-3">
          Padelnity está dirigido a usuarios mayores de <strong>{PRIVACY_CONFIG.minAge} anos</strong>. 
          Los menores de esta edad requieren autorización parental para usar la plataforma.
        </p>
        <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
          <li>No recopilamos conscientemente datos de menores sin consentimiento parental</li>
          <li>Si descubrimos que hemos recopilado datos de un menor sin autorización, los eliminaremos</li>
          <li>Los padres pueden solicitar acceso, rectificación o eliminación de datos de sus hijos</li>
        </ul>
      </div>
    </div>
  </section>
))

MinorsSection.displayName = 'MinorsSection'

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
      
      <Link href="/terms" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Términos y Condiciones
        </Button>
      </Link>
      
      <Link href="/help" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          ¿Necesitas Ayuda?
        </Button>
      </Link>
    </div>
  )
})

NavigationLinks.displayName = 'NavigationLinks'

// Main Client Component
export default function PrivacyPageClient() {
  const { isKeyboardVisible: isKeyboardOpen } = useKeyboardDetection()
  const scrollToSection = useScrollToSection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl border-0 overflow-hidden">
          <PrivacyHeader />
          
          <CardContent className="p-8">
            <TableOfContents scrollToSection={scrollToSection} />
            
            <div className="space-y-8">
              <DataCollectionSection />
              <DataUsageSection />
              <DataSharingSection />
              <DataSecuritySection />
              <UserRightsSection />
              <CookiesSection />
              <MinorsSection />
              
              {/* Secciones adicionales */}
              <section id="contact" className="scroll-mt-4 mb-8">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">10. Contacto</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    Para consultas sobre privacidad y protección de datos:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Responsable de Protección de Datos:</p>
                      <p className="text-emerald-600">{PRIVACY_CONFIG.dpoEmail}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Contacto General de Privacidad:</p>
                      <p className="text-emerald-600">{PRIVACY_CONFIG.contactEmail}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-900">Empresa:</p>
                    <p className="text-gray-700">{PRIVACY_CONFIG.companyName}</p>
                    <p className="text-gray-700">{PRIVACY_CONFIG.address}</p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        <NavigationLinks isKeyboardVisible={isKeyboardOpen} />
      </div>
    </div>
  )
} 