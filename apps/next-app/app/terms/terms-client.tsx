'use client'

import Link from "next/link"
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Scale, Edit, Mail, Globe, Gavel, Clock, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useCallback } from "react"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"

// Configuration
const TERMS_CONFIG = {
  lastUpdated: new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  contactEmail: 'legal@padelnity.com',
  minAge: 16,
  companyName: 'Padelnity SL',
  address: 'Madrid, España'
} as const

// Table of Contents Data
const TOC_ITEMS = [
  { id: 'acceptance', title: '1. Aceptación de Términos' },
  { id: 'service-description', title: '2. Descripción del Servicio' },
  { id: 'user-registration', title: '3. Registro de Usuario' },
  { id: 'acceptable-use', title: '4. Uso Aceptable' },
  { id: 'privacy-data', title: '5. Privacidad y Datos' },
  { id: 'responsibility', title: '6. Responsabilidad' },
  { id: 'intellectual-property', title: '7. Propiedad Intelectual' },
  { id: 'payments', title: '8. Pagos y Suscripciones' },
  { id: 'termination', title: '9. Terminación del Servicio' },
  { id: 'modifications', title: '10. Modificaciones' },
  { id: 'jurisdiction', title: '11. Jurisdicción Aplicable' },
  { id: 'contact', title: '12. Contacto' }
] as const

// Custom Hook
const useScrollToSection = () => {
  return useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])
}

// Optimized Components
const TermsHeader = memo(() => (
  <CardHeader className="text-center pb-8 bg-gradient-to-r from-emerald-50 to-teal-50">
    <div className="flex items-center justify-center mb-6">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg">
        <FileText className="h-10 w-10 text-white" />
      </div>
    </div>
    <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
      Términos y Condiciones
    </CardTitle>
    <p className="text-gray-600 text-lg">
      Normas y condiciones de uso de nuestra plataforma
    </p>
    <p className="text-sm text-gray-500 mt-4">
      Última actualización: {TERMS_CONFIG.lastUpdated}
    </p>
  </CardHeader>
))

TermsHeader.displayName = 'TermsHeader'

const TableOfContents = memo(({ scrollToSection }: { scrollToSection: (id: string) => void }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
      <FileText className="h-5 w-5 text-emerald-600 mr-2" />
      Índice de Contenidos
    </h3>
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {TOC_ITEMS.map(item => (
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

// Reusable Section Component
const TermsSection = memo(({ 
  id, 
  title, 
  icon: Icon, 
  children 
}: { 
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) => (
  <section id={id} className="scroll-mt-4 mb-8">
    <div className="flex items-center mb-4">
      <Icon className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
    </div>
    {children}
  </section>
))

TermsSection.displayName = 'TermsSection'

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
      
      <Link href="/privacy" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <Shield className="w-4 h-4 mr-2" />
        Política de Privacidad
        </Button>
      </Link>
      
      <Link href="/help" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full sm:w-auto flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Centro de Ayuda
        </Button>
      </Link>
    </div>
  )
})

NavigationLinks.displayName = 'NavigationLinks'

// Main Optimized Component
export default function TermsPageClient() {
  const { isKeyboardVisible } = useKeyboardDetection()
  const scrollToSection = useScrollToSection()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl border-0 overflow-hidden">
          <TermsHeader />

          <CardContent className="p-8">
            <TableOfContents scrollToSection={scrollToSection} />
            
            <div className="space-y-8">
              <TermsSection id="acceptance" title="1. Aceptación de Términos" icon={UserCheck}>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Al acceder y utilizar <strong>{TERMS_CONFIG.companyName}</strong>, aceptas estar sujeto a estos 
                    términos y condiciones de uso, así como a nuestra Política de Privacidad.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Si no estás de acuerdo con alguna parte de estos términos, debes dejar de utilizar 
                    inmediatamente nuestro servicio. El uso continuado constituye aceptación de cualquier 
                    modificación a estos términos.
                  </p>
                </div>
              </TermsSection>

              <TermsSection id="service-description" title="2. Descripción del Servicio" icon={Globe}>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Padelnity</strong> es una plataforma digital innovadora que permite a los usuarios:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Crear y gestionar perfiles de jugador de pádel</li>
                    <li>Organizar y participar en torneos y partidas</li>
                    <li>Conectar con otros jugadores de tu nivel y zona</li>
                    <li>Reservar pistas deportivas (cuando esté disponible)</li>
                    <li>Acceder a estadísticas y seguimiento de rendimiento</li>
                    <li>Comunicarse con la comunidad padelista</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto 
                    del servicio en cualquier momento, con o sin previo aviso.
                  </p>
                </div>
              </TermsSection>

              <TermsSection id="user-registration" title="3. Registro de Usuario" icon={Users}>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Requisitos para el Registro</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Ser mayor de <strong>{TERMS_CONFIG.minAge} anos</strong> o contar con autorización parental</li>
                      <li>Proporcionar información personal veraz y actualizada</li>
                      <li>Utilizar un email válido al que tengas acceso</li>
                      <li>Crear una contraseña segura</li>
                      <li>Aceptar estos términos y la política de privacidad</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Responsabilidades del Usuario
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-amber-800">
                      <li>Mantener la confidencialidad de tu cuenta y contraseña</li>
                      <li>No compartir tu cuenta con terceros</li>
                      <li>Notificar inmediatamente cualquier uso no autorizado</li>
                      <li>No crear múltiples cuentas sin autorización expresa</li>
                      <li>Actualizar tu información personal cuando sea necesario</li>
                    </ul>
                  </div>
                </div>
              </TermsSection>

              <TermsSection id="acceptable-use" title="4. Uso Aceptable" icon={Shield}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Prohibido</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Actividades ilegales o fraudulentas</li>
                        <li>• Hostigamiento o comportamiento abusivo</li>
                        <li>• Spam o comunicaciones no solicitadas</li>
                        <li>• Uso de bots o automatización no autorizada</li>
                        <li>• Intentos de acceso no autorizado</li>
                        <li>• Distribución de malware o virus</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-green-900 mb-2">✅ Permitido</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Crear y compartir contenido deportivo</li>
                        <li>• Organizar eventos y torneos</li>
                        <li>• Conectar con otros jugadores</li>
                        <li>• Compartir estadísticas y logros</li>
                        <li>• Participar en la comunidad</li>
                        <li>• Reportar problemas técnicos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TermsSection>

              <TermsSection id="privacy-data" title="5. Privacidad y Datos" icon={Scale}>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-blue-900 font-medium mb-3">
                    Tu privacidad es fundamental para nosotros
                  </p>
                  <p className="text-blue-800 leading-relaxed mb-4">
                    El tratamiento de tus datos personales se rige por nuestra <strong>Política de Privacidad</strong>, 
                    que forma parte integral de estos términos. Al usar nuestro servicio, consientes el 
                    procesamiento de tus datos según se describe en dicha política.
                  </p>
                  <Link href="/privacy" className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium">
                    Ver Política de Privacidad <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                  </Link>
                </div>
              </TermsSection>

              <TermsSection id="responsibility" title="6. Responsabilidad" icon={AlertTriangle}>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-semibold text-red-900 mb-3">Limitación de Responsabilidad</h4>
                    <p className="text-red-800 leading-relaxed">
                      <strong>{TERMS_CONFIG.companyName}</strong> no será responsable de danos indirectos, 
                      incidentales, especiales o consecuentes resultantes del uso o la imposibilidad de 
                      usar nuestro servicio, incluyendo pero no limitándose a pérdida de datos, 
                      ganancias o oportunidades comerciales.
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Los usuarios son responsables de sus propias acciones y del contenido que publican. 
                    Padelnity actúa como intermediario y no garantiza la exactitud o veracidad de 
                    la información proporcionada por los usuarios.
                  </p>
                </div>
              </TermsSection>

              <TermsSection id="intellectual-property" title="7. Propiedad Intelectual" icon={Edit}>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Todo el contenido de la plataforma, incluyendo pero no limitándose a texto, gráficos, 
                    logos, íconos, imágenes, clips de audio, descargas digitales y software, es propiedad 
                    de <strong>{TERMS_CONFIG.companyName}</strong> o sus proveedores de contenido.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Derechos del Usuario</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Conservas los derechos sobre el contenido que publicas</li>
                      <li>Otorgas a Padelnity una licencia para usar tu contenido</li>
                      <li>Puedes eliminar tu contenido en cualquier momento</li>
                      <li>Eres responsable de tener los derechos necesarios</li>
                    </ul>
                  </div>
                </div>
              </TermsSection>

              <TermsSection id="payments" title="8. Pagos y Suscripciones" icon={Gavel}>
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-3">Información de Facturación</h4>
                    <ul className="list-disc list-inside space-y-2 text-green-800">
                      <li>Los precios incluyen todos los impuestos aplicables</li>
                      <li>Los pagos se procesan de forma segura mediante Stripe</li>
                      <li>Las suscripciones se renuevan automáticamente</li>
                      <li>Puedes cancelar en cualquier momento desde tu perfil</li>
                      <li>Los reembolsos se procesan según nuestra política</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Nos reservamos el derecho de cambiar nuestros precios en cualquier momento. 
                    Los cambios de precio se notificarán con al menos 30 días de anticipación 
                    para usuarios existentes.
                  </p>
                </div>
              </TermsSection>

              <TermsSection id="termination" title="9. Terminación del Servicio" icon={Clock}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Terminación por el Usuario</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Puedes terminar tu cuenta en cualquier momento a través de la configuración 
                      de tu perfil o contactando a nuestro soporte. Tras la terminación, tu acceso 
                      se suspenderá inmediatamente.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Terminación por Padelnity</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Podemos suspender o terminar tu cuenta si violas estos términos, 
                      realizas actividades fraudulentas o por otras causas justificadas. 
                      Te notificaremos cuando sea posible.
                    </p>
                  </div>
                </div>
              </TermsSection>

              <TermsSection id="modifications" title="10. Modificaciones" icon={Edit}>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                    Las modificaciones entrarán en vigor inmediatamente tras su publicación en 
                    nuestro sitio web.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Te notificaremos sobre cambios significativos por email o mediante avisos 
                    prominentes en nuestro servicio. El uso continuado constituye aceptación 
                    de los términos modificados.
                  </p>
                </div>
              </TermsSection>

              <TermsSection id="jurisdiction" title="11. Jurisdicción Aplicable" icon={Scale}>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Estos términos se rigen por las leyes de España. Cualquier disputa será 
                    resuelta en los tribunales competentes de <strong>{TERMS_CONFIG.address}</strong>.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    En caso de que alguna disposición sea considerada inválida, el resto de 
                    los términos permanecerá en pleno vigor y efecto.
                  </p>
                </div>
              </TermsSection>

              <TermsSection id="contact" title="12. Contacto" icon={Mail}>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Email:</strong> <a href={`mailto:${TERMS_CONFIG.contactEmail}`} className="text-emerald-600 hover:text-emerald-800">{TERMS_CONFIG.contactEmail}</a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Empresa:</strong> {TERMS_CONFIG.companyName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Dirección:</strong> {TERMS_CONFIG.address}
                    </p>
                  </div>
                </div>
              </TermsSection>
            </div>
          </CardContent>
        </Card>

        <NavigationLinks isKeyboardVisible={isKeyboardVisible} />
      </div>
    </div>
  )
} 