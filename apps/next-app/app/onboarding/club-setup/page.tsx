'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, ArrowLeft, Store, GraduationCap, Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useOnboarding } from '@/hooks/useOnboarding'
import { createBusinessProfile, uploadImage, mapToBusinessFormData, type BusinessFormData } from '@/lib/onboarding'

// Importar formularios específicos
import ClubForm, { type ClubFormData } from '@/components/onboarding/business-forms/ClubForm'
import TiendaForm, { type TiendaFormData } from '@/components/onboarding/business-forms/TiendaForm'
import AcademiaForm, { type AcademiaFormData } from '@/components/onboarding/business-forms/AcademiaForm'
import InstalacionForm, { type InstalacionFormData } from '@/components/onboarding/business-forms/InstalacionForm'

// TIPOS DE NEGOCIO
const BUSINESS_TYPES = [
  { 
    value: "club", 
    label: "Club de Padel",
    description: "Club especializado en padel con pistas propias",
    icon: Building2
  },
  { 
    value: "tienda", 
    label: "Tienda de Material",
    description: "Venta de material deportivo y accesorios",
    icon: Store
  },
  { 
    value: "academia", 
    label: "Academia/Escuela",
    description: "Enseñanza y entrenamiento de padel",
    icon: GraduationCap
  },
  { 
    value: "instalacion", 
    label: "Instalación Deportiva",
    description: "Centro deportivo multidisciplinar",
    icon: Dumbbell
  }
]

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -inset-10 opacity-50">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </div>
  </div>
)

export default function ClubSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useToast()
  const { refreshStatus } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('')

  // Handler para el envío de formularios específicos
  const handleFormSubmit = async (formData: ClubFormData | TiendaFormData | AcademiaFormData | InstalacionFormData) => {
    if (!user?.id) {
      error('Error: Usuario no autenticado')
      return
    }

    try {
      setLoading(true)

      // Subir imágenes a Supabase Storage si existen
      let avatarUrl = undefined
      let bannerUrl = undefined

      if (formData.avatarFile) {
        const avatarResult = await uploadImage(formData.avatarFile, 'avatars', user.id)
        if (avatarResult.success) {
          avatarUrl = avatarResult.url
        } else {
          console.error('Error subiendo avatar:', avatarResult.error)
          error('Error al subir la imagen de perfil')
          return
        }
      }

      if (formData.bannerFile) {
        const bannerResult = await uploadImage(formData.bannerFile, 'banners', user.id)
        if (bannerResult.success) {
          bannerUrl = bannerResult.url
        } else {
          console.error('Error subiendo banner:', bannerResult.error)
          error('Error al subir la imagen de portada')
          return
        }
      }

      // Mapear datos específicos al formato general usando la función importada
      const businessData: BusinessFormData = {
        ...mapToBusinessFormData(selectedBusinessType, formData),
        ...(avatarUrl && { avatarUrl }),
        ...(bannerUrl && { bannerUrl }),
      }

      console.log('Datos del negocio a enviar:', businessData)

      // Crear perfil de negocio
      const result = await createBusinessProfile(user.id, businessData)
      
      if (result.success) {
        success('¡Perfil de negocio configurado exitosamente!')
        
        // Refrescar el estado de onboarding para que el middleware lo reconozca
        await refreshStatus()
        
        // Forzar una navegación completa al dashboard para refrescar todo el estado
        window.location.href = '/dashboard'
      } else {
        console.error('Error creando perfil:', result.error)
        error(`Error al crear el perfil: ${result.error}`)
      }
    } catch (err) {
      console.error('Error en handleFormSubmit:', err)
      error('Error inesperado al configurar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const renderBusinessForm = () => {
    switch (selectedBusinessType) {
      case 'club':
        return <ClubForm onSubmit={handleFormSubmit} loading={loading} />
      case 'tienda':
        return <TiendaForm onSubmit={handleFormSubmit} loading={loading} />
      case 'academia':
        return <AcademiaForm onSubmit={handleFormSubmit} loading={loading} />
      case 'instalacion':
        return <InstalacionForm onSubmit={handleFormSubmit} loading={loading} />
      default:
        return null
    }
  }

  const getSelectedBusinessLabel = () => {
    const business = BUSINESS_TYPES.find(type => type.value === selectedBusinessType)
    return business?.label || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 relative">
      <BackgroundPattern />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Tarjeta única con todo el contenido */}
          <Card className="shadow-2xl border-0 bg-white">
            <CardContent className="p-4 sm:p-6 md:p-8">
              {/* Logo y encabezado dentro de la tarjeta */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <Image
                    src="/logo/logoverde.webp"
                    alt="Padelnity Logo"
                    width={120}
                    height={60}
                    className="h-12 w-auto"
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Configuración de Negocio
                </h1>
                <p className="text-gray-600 text-base sm:text-lg">
                  Configura tu perfil profesional en Padelnity
                </p>
              </div>

              {!selectedBusinessType ? (
                <>
                  {/* Selección de tipo de negocio */}
                  <div className="space-y-4 mb-6">
                    <Label className="text-base sm:text-lg font-semibold text-gray-900">
                      ¿Qué tipo de negocio tienes?
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {BUSINESS_TYPES.map((type) => {
                        const IconComponent = type.icon
                        return (
                          <div
                            key={type.value}
                            onClick={() => setSelectedBusinessType(type.value)}
                            className="group cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <IconComponent className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-emerald-900">
                                  {type.label}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Botón volver */}
                  <div className="flex justify-center pt-4">
                    <Link href="/onboarding/select-role">
                      <Button variant="outline" className="flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Encabezado del formulario seleccionado */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {getSelectedBusinessLabel()}
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBusinessType('')}
                        className="flex items-center space-x-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Cambiar</span>
                      </Button>
                    </div>
                    <p className="text-gray-600">
                      Completa la información de tu {getSelectedBusinessLabel().toLowerCase()}
                    </p>
                  </div>

                  {/* Renderizar formulario específico */}
                  {renderBusinessForm()}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}