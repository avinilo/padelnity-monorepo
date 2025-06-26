'use client'

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/hooks/useOnboarding"
import { useKeyboardDetection } from "@/hooks/useKeyboardDetection"
import { createPlayerProfile, uploadImage, type PlayerFormData } from "@/lib/onboarding"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Upload, X, ArrowLeft, Camera, Image as ImageIcon } from "lucide-react"

// ==========================================
// COMPONENTES REUTILIZABLES OPTIMIZADOS
// ==========================================

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -inset-10 opacity-50">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
    </div>
  </div>
)

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

const ScreenContainer = ({ children }: { children: React.ReactNode }) => {
  const { isKeyboardVisible } = useKeyboardDetection()
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center p-3 sm:p-4 ${isKeyboardVisible ? 'pb-2' : ''}`}>
      <BackgroundPattern />
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

// ==========================================
// CONSTANTES OPTIMIZADAS Y AGRUPADAS
// ==========================================

// Datos básicos de juego
const BASIC_INFO = {
  NIVELES: [
    { value: "principiante", label: "Principiante" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" },
    { value: "profesional", label: "Profesional" }
  ],
  EXPERIENCIA: [
    { value: "< 1 año", label: "Menos de 1 año" },
    { value: "1-3 años", label: "1 - 3 años" },
    { value: "3-5 años", label: "3 - 5 años" },
    { value: "5+ años", label: "Más de 5 años" }
  ],
  POSICIONES: [
    { value: "reves", label: "Revés" },
    { value: "drive", label: "Drive" },
    { value: "cualquiera", label: "Ambas posiciones" }
  ]
}

// Perfil del jugador
const PLAYER_PROFILE = {
  MANO_DOMINANTE: [
    { value: "diestro", label: "Diestro" },
    { value: "zurdo", label: "Zurdo" }
  ],
  ESTILOS_JUEGO: [
    { value: "agresivo", label: "Agresivo - Me gusta atacar" },
    { value: "defensivo", label: "Defensivo - Prefiero devolver bien" },
    { value: "equilibrado", label: "Equilibrado - Ataque y defensa" },
    { value: "tecnico", label: "Técnico - Me centro en la precisión" }
  ],
  IDIOMAS: [
    { value: "español", label: "Español" },
    { value: "inglés", label: "Inglés" },
    { value: "francés", label: "Francés" },
    { value: "alemán", label: "Alemán" },
    { value: "italiano", label: "Italiano" },
    { value: "portugués", label: "Portugués" }
  ]
}

// Objetivos y preferencias
const PREFERENCES = {
  OBJETIVOS: [
    { value: "mejorar-tecnica", label: "Mejorar mi técnica" },
    { value: "competir-torneos", label: "Competir en torneos" },
    { value: "socializar", label: "Conocer gente y socializar" },
    { value: "ejercicio", label: "Hacer ejercicio y mantenerme en forma" },
    { value: "diversion", label: "Divertirme y desestresarme" },
    { value: "profesional", label: "Llegar a nivel profesional" }
  ],
  DISPONIBILIDAD: [
    { value: "mañanas", label: "Mañanas" },
    { value: "tardes", label: "Tardes" },
    { value: "noches", label: "Noches" },
    { value: "fines-semana", label: "Fines de semana" },
    { value: "flexible", label: "Horario flexible" }
  ],
  FRECUENCIA_JUEGO: [
    { value: "1-vez-semana", label: "1 vez por semana" },
    { value: "2-veces-semana", label: "2 veces por semana" },
    { value: "3-4-veces-semana", label: "3-4 veces por semana" },
    { value: "diario", label: "Diariamente" },
    { value: "ocasional", label: "Ocasionalmente" }
  ],
  TIPOS_COMPAÑERO: [
    { value: "mismo-nivel", label: "Mismo nivel que yo" },
    { value: "mejor-nivel", label: "Mejor nivel (para aprender)" },
    { value: "menor-nivel", label: "Menor nivel (para enseñar)" },
    { value: "competitivo", label: "Enfoque competitivo" },
    { value: "recreativo", label: "Enfoque recreativo" },
    { value: "cualquiera", label: "Cualquier tipo" }
  ]
}

// Constantes para fecha de nacimiento
const DIAS = Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))
const MESES = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" }
]
const currentYear = new Date().getFullYear()
const AÑOS = Array.from({ length: 80 }, (_, i) => ({ 
  value: (currentYear - 16 - i).toString(), 
  label: (currentYear - 16 - i).toString() 
})) // Desde 16 años hasta 95 años

// ==========================================
// INTERFACES OPTIMIZADAS
// ==========================================

interface FormData {
  // Información básica
  fullName: string
  nivel: string
  experiencia: string
  posicionFavorita: string
  ubicacion: string
  telefono: string
  biografia: string
  
  // Perfil extendido
  fechaNacimiento: {
    dia: string
    mes: string
    año: string
  }
  manoDominante: string
  estiloJuego: string
  frecuenciaJuego: string
  clubsHabituales: string
  
  // Arrays de selección múltiple
  objetivos: string[]
  disponibilidad: string[]
  idiomas: string[]
  tiposCompañero: string[]
  
  // Redes sociales
  instagramUrl: string
  facebookUrl: string
  twitterUrl: string
  
  // Archivos de imagen
  avatarFile: File | null
  bannerFile: File | null
}

// ==========================================
// COMPONENTE PRINCIPAL OPTIMIZADO
// ==========================================

export default function PlayerSetupPage() {
  // Estados unificados
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    nivel: '',
    experiencia: '',
    posicionFavorita: '',
    ubicacion: '',
    telefono: '',
    biografia: '',
    fechaNacimiento: {
      dia: '',
      mes: '',
      año: ''
    },
    manoDominante: '',
    estiloJuego: '',
    frecuenciaJuego: '',
    clubsHabituales: '',
    objetivos: [],
    disponibilidad: [],
    idiomas: [],
    tiposCompañero: [],
    // Redes sociales
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    avatarFile: null,
    bannerFile: null
  })
  
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  
  // Hooks
  const { user } = useAuth()
  const { success, error } = useToast()
  const router = useRouter()
  const { refreshStatus } = useOnboarding()

  // ==========================================
  // FUNCIONES OPTIMIZADAS
  // ==========================================

  // Función unificada para cambios de input
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Función optimizada para arrays
  const handleArrayToggle = (field: 'objetivos' | 'disponibilidad' | 'idiomas' | 'tiposCompañero', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  // Función unificada para manejo de imágenes
  const handleImageUpload = (type: 'avatar' | 'banner', file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (type === 'avatar') {
          setAvatarPreview(result)
          setFormData(prev => ({ ...prev, avatarFile: file }))
        } else {
          setBannerPreview(result)
          setFormData(prev => ({ ...prev, bannerFile: file }))
        }
      }
      reader.readAsDataURL(file)
    } else {
      error('Por favor selecciona un archivo de imagen válido')
    }
  }

  // Función unificada para remover imágenes
  const removeImage = (type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      setAvatarPreview(null)
      setFormData(prev => ({ ...prev, avatarFile: null }))
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    } else {
      setBannerPreview(null)
      setFormData(prev => ({ ...prev, bannerFile: null }))
      if (bannerInputRef.current) bannerInputRef.current.value = ''
    }
  }

  // Validación optimizada sin efectos secundarios para el botón
  const isFormValid = useCallback(() => {
    return formData.fullName.trim() &&
           formData.nivel &&
           formData.experiencia &&
           formData.posicionFavorita &&
           formData.objetivos.length > 0 &&
           formData.disponibilidad.length > 0
  }, [formData.fullName, formData.nivel, formData.experiencia, formData.posicionFavorita, formData.objetivos, formData.disponibilidad])

  // Validación con mensajes de error para el submit
  const validateFormWithMessages = () => {
    const requiredFields = [
      { field: formData.fullName.trim(), message: 'El nombre completo es obligatorio' },
      { field: formData.nivel, message: 'Por favor selecciona tu nivel de juego' },
      { field: formData.experiencia, message: 'Por favor indica tu experiencia jugando' },
      { field: formData.posicionFavorita, message: 'Por favor selecciona tu posición favorita' }
    ]

    for (const { field, message } of requiredFields) {
      if (!field) {
        error(message)
        return false
      }
    }

    if (formData.objetivos.length === 0) {
      error('Selecciona al menos un objetivo')
      return false
    }
    if (formData.disponibilidad.length === 0) {
      error('Indica tu disponibilidad horaria')
      return false
    }
    return true
  }

  // Submit optimizado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateFormWithMessages()) return

    // Verificar que el usuario esté autenticado
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
          error('Error al subir la foto de perfil. Inténtalo de nuevo.')
          return
        }
      }

      if (formData.bannerFile) {
        const bannerResult = await uploadImage(formData.bannerFile, 'banners', user.id)
        if (bannerResult.success) {
          bannerUrl = bannerResult.url
        } else {
          console.error('Error subiendo banner:', bannerResult.error)
          error('Error al subir la imagen de portada. Inténtalo de nuevo.')
          return
        }
      }
      
      // Mapear a la interfaz PlayerFormData correcta
      const playerData: PlayerFormData = {
        fullName: formData.fullName.trim(),
        ubicacion: formData.ubicacion.trim(),
        telefono: formData.telefono.trim(),
        biografia: formData.biografia.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        manoDominante: formData.manoDominante,
        nivel: formData.nivel,
        experiencia: formData.experiencia,
        posicionFavorita: formData.posicionFavorita,
        estiloJuego: formData.estiloJuego,
        frecuenciaJuego: formData.frecuenciaJuego,
        clubsHabituales: formData.clubsHabituales.trim(),
        objetivos: formData.objetivos,
        disponibilidad: formData.disponibilidad,
        idiomas: formData.idiomas,
        tiposCompañero: formData.tiposCompañero,
        // Redes sociales
        instagramUrl: formData.instagramUrl.trim(),
        facebookUrl: formData.facebookUrl.trim(),
        twitterUrl: formData.twitterUrl.trim(),
        ...(avatarUrl && { avatarUrl }),
        ...(bannerUrl && { bannerUrl }),
      }

      const result = await createPlayerProfile(user.id, playerData)
      
      if (!result.success) throw result.error

      success('¡Perfil configurado exitosamente!')
      
      // Actualizar estado y redirigir (solución para problema de sincronización)
      await refreshStatus()
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Error al crear perfil de jugador:', err)
      error('Error al guardar el perfil. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // RENDER OPTIMIZADO
  // ==========================================

  return (
    <ScreenContainer>
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <Logo />
          <div className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Configura tu perfil de jugador
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Completa tu información para conectar con otros jugadores
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* INFORMACIÓN PERSONAL */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nombre completo *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Tu nombre completo"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ubicacion" className="text-sm font-medium text-gray-700">
                    Ubicación
                  </Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    placeholder="Ciudad, país"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Fecha de nacimiento
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <Label htmlFor="dia" className="text-xs text-gray-600">Día</Label>
                      <select
                        id="dia"
                        value={formData.fechaNacimiento.dia}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          fechaNacimiento: { ...prev.fechaNacimiento, dia: e.target.value }
                        }))}
                        className="w-full h-12 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        <option value="">Día</option>
                        {DIAS.map((dia) => (
                          <option key={dia.value} value={dia.value}>
                            {dia.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="mes" className="text-xs text-gray-600">Mes</Label>
                      <select
                        id="mes"
                        value={formData.fechaNacimiento.mes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          fechaNacimiento: { ...prev.fechaNacimiento, mes: e.target.value }
                        }))}
                        className="w-full h-12 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        <option value="">Mes</option>
                        {MESES.map((mes) => (
                          <option key={mes.value} value={mes.value}>
                            {mes.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="año" className="text-xs text-gray-600">Año</Label>
                      <select
                        id="año"
                        value={formData.fechaNacimiento.año}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          fechaNacimiento: { ...prev.fechaNacimiento, año: e.target.value }
                        }))}
                        className="w-full h-12 px-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      >
                        <option value="">Año</option>
                        {AÑOS.map((año) => (
                          <option key={año.value} value={año.value}>
                            {año.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+34 000 000 000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Idiomas que hablas
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PLAYER_PROFILE.IDIOMAS.map((idioma) => (
                      <div key={idioma.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`idioma-${idioma.value}`}
                          checked={formData.idiomas.includes(idioma.value)}
                          onCheckedChange={() => handleArrayToggle('idiomas', idioma.value)}
                        />
                        <Label htmlFor={`idioma-${idioma.value}`} className="text-sm text-gray-700">
                          {idioma.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN DE JUEGO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Tu Juego
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Nivel de juego *
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {BASIC_INFO.NIVELES.map((nivel) => (
                    <button
                      key={nivel.value}
                      type="button"
                      onClick={() => handleInputChange('nivel', nivel.value)}
                      className={`p-3 text-sm rounded-lg border-2 transition-all ${
                        formData.nivel === nivel.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {nivel.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Experiencia jugando *
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {BASIC_INFO.EXPERIENCIA.map((exp) => (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() => handleInputChange('experiencia', exp.value)}
                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                        formData.experiencia === exp.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Posición favorita *
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {BASIC_INFO.POSICIONES.map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => handleInputChange('posicionFavorita', pos.value)}
                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                        formData.posicionFavorita === pos.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Mano dominante
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PLAYER_PROFILE.MANO_DOMINANTE.map((mano) => (
                    <button
                      key={mano.value}
                      type="button"
                      onClick={() => handleInputChange('manoDominante', mano.value)}
                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                        formData.manoDominante === mano.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {mano.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Estilo de juego
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {PLAYER_PROFILE.ESTILOS_JUEGO.map((estilo) => (
                    <button
                      key={estilo.value}
                      type="button"
                      onClick={() => handleInputChange('estiloJuego', estilo.value)}
                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                        formData.estiloJuego === estilo.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {estilo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* OBJETIVOS */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                ¿Cuáles son tus objetivos? * (Puedes seleccionar varios)
              </Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {PREFERENCES.OBJETIVOS.map((objetivo) => (
                  <div key={objetivo.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`objetivo-${objetivo.value}`}
                      checked={formData.objetivos.includes(objetivo.value)}
                      onCheckedChange={() => handleArrayToggle('objetivos', objetivo.value)}
                    />
                    <Label htmlFor={`objetivo-${objetivo.value}`} className="text-sm text-gray-700">
                      {objetivo.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* DISPONIBILIDAD */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                ¿Cuándo sueles estar disponible? * (Puedes seleccionar varios)
              </Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {PREFERENCES.DISPONIBILIDAD.map((horario) => (
                  <div key={horario.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`disponibilidad-${horario.value}`}
                      checked={formData.disponibilidad.includes(horario.value)}
                      onCheckedChange={() => handleArrayToggle('disponibilidad', horario.value)}
                    />
                    <Label htmlFor={`disponibilidad-${horario.value}`} className="text-sm text-gray-700">
                      {horario.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* PREFERENCIAS DE JUEGO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Preferencias de Juego
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  ¿Con qué frecuencia juegas?
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {PREFERENCES.FRECUENCIA_JUEGO.map((frecuencia) => (
                    <button
                      key={frecuencia.value}
                      type="button"
                      onClick={() => handleInputChange('frecuenciaJuego', frecuencia.value)}
                      className={`p-2 text-sm rounded-lg border-2 transition-all ${
                        formData.frecuenciaJuego === frecuencia.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {frecuencia.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Tipo de compañero que prefieres (Puedes seleccionar varios)
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {PREFERENCES.TIPOS_COMPAÑERO.map((tipo) => (
                    <div key={tipo.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tipo-${tipo.value}`}
                        checked={formData.tiposCompañero.includes(tipo.value)}
                        onCheckedChange={() => handleArrayToggle('tiposCompañero', tipo.value)}
                      />
                      <Label htmlFor={`tipo-${tipo.value}`} className="text-sm text-gray-700">
                        {tipo.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

                              <div>
                  <Label htmlFor="clubsHabituales" className="text-sm font-medium text-gray-700">
                    Clubs donde sueles jugar
                  </Label>
                <Input
                  id="clubsHabituales"
                  value={formData.clubsHabituales}
                  onChange={(e) => handleInputChange('clubsHabituales', e.target.value)}
                  placeholder="Club Deportivo XYZ, Padel Center ABC..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* BIOGRAFÍA */}
            <div>
              <Label htmlFor="biografia" className="text-sm font-medium text-gray-700">
                Cuéntanos sobre ti (Opcional)
              </Label>
              <Textarea
                id="biografia"
                value={formData.biografia}
                onChange={(e) => handleInputChange('biografia', e.target.value)}
                placeholder="Cuéntanos algo sobre ti, tu experiencia en el pádel, qué te gusta del deporte..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* REDES SOCIALES */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Redes sociales (opcional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl" className="text-sm font-medium text-gray-700">
                    Instagram
                  </Label>
                  <Input
                    type="text"
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                    placeholder="Ej: instagram.com/miusuario o @miusuario"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookUrl" className="text-sm font-medium text-gray-700">
                    Facebook
                  </Label>
                  <Input
                    type="text"
                    id="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                    placeholder="Ej: facebook.com/miusuario"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="twitterUrl" className="text-sm font-medium text-gray-700">
                    Twitter/X
                  </Label>
                  <Input
                    type="text"
                    id="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                    placeholder="Ej: twitter.com/miusuario o @miusuario"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* FOTOS DE PERFIL */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Fotos de perfil
              </h3>
              
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Imágenes del perfil</h4>
                
                {/* Avatar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Foto de perfil (opcional)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Avatar preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload('avatar', file)
                      }}
                      className="hidden"
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Subir foto</span>
                      </Button>
                      {avatarPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage('avatar')}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                          <span>Quitar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Imagen de portada (opcional)
                  </Label>
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="w-full h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {bannerPreview ? (
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Imagen de portada del perfil</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload('banner', file)
                      }}
                      className="hidden"
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => bannerInputRef.current?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Subir portada</span>
                      </Button>
                      {bannerPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage('banner')}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                          <span>Quitar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Completar registro'
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-500">
            Al completar tu perfil aceptas nuestros{" "}
            <Link
              href="/terms"
              className="text-emerald-600 hover:text-emerald-700 underline"
            >
              términos y condiciones
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-3 mt-6">
        <Link
          href="/onboarding/select-role"
          className="inline-flex items-center text-white hover:text-white/90 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a selección de rol
        </Link>

        <div className="text-sm text-white/80">
          ¿Necesitas ayuda?{" "}
          <Link
            href="/help"
            className="font-semibold text-white underline hover:text-white/90 hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            Centro de ayuda
          </Link>
        </div>
      </div>
    </ScreenContainer>
  )
} 