'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// Constantes específicas para Instalación Deportiva con enfoque en padel
const HORAS = Array.from({ length: 24 }, (_, i) => {
  const hora = i.toString().padStart(2, '0')
  return { value: `${hora}:00`, label: `${hora}:00` }
})

const YEARS_EXPERIENCE = [
  { value: "0-1", label: "Menos de 1 año" },
  { value: "1-3", label: "1-3 años" },
  { value: "3-5", label: "3-5 años" },
  { value: "5-10", label: "5-10 años" },
  { value: "10-15", label: "10-15 años" },
  { value: "15+", label: "Más de 15 años" }
]

const LANGUAGES = [
  { value: "espanol", label: "Español" },
  { value: "ingles", label: "Inglés" },
  { value: "frances", label: "Francés" },
  { value: "aleman", label: "Alemán" },
  { value: "italiano", label: "Italiano" },
  { value: "portugues", label: "Portugués" }
]

const PADEL_COURT_TYPES = [
  { value: "cristal", label: "Pistas de cristal" },
  { value: "malla", label: "Pistas de malla" },
  { value: "mixtas", label: "Pistas mixtas (cristal + malla)" },
  { value: "panoramicas", label: "Pistas panorámicas" },
  { value: "cubiertas", label: "Pistas cubiertas" },
  { value: "exteriores", label: "Pistas exteriores" }
]

const PADEL_SERVICES = [
  { value: "alquiler-pistas-padel", label: "Alquiler de pistas de padel" },
  { value: "clases-padel", label: "Clases de padel" },
  { value: "torneos-padel", label: "Torneos de padel" },
  { value: "ligas-padel", label: "Ligas de padel" },
  { value: "alquiler-material-padel", label: "Alquiler de material de padel" },
  { value: "tienda-padel", label: "Tienda de material de padel" },
  { value: "eventos-corporativos-padel", label: "Eventos corporativos de padel" },
  { value: "campus-padel", label: "Campus de padel" }
]

const OTHER_SPORTS = [
  { value: "tenis", label: "Tenis" },
  { value: "futbol-sala", label: "Fútbol sala" },
  { value: "basquet", label: "Baloncesto" },
  { value: "voleibol", label: "Voleibol" },
  { value: "squash", label: "Squash" },
  { value: "badminton", label: "Bádminton" },
  { value: "multideporte", label: "Pistas multideporte" },
  { value: "natacion", label: "Natación" },
  { value: "fitness", label: "Fitness/Gimnasio" }
]

const ADDITIONAL_FACILITIES = [
  { value: "vestuarios-padel", label: "Vestuarios específicos para padel" },
  { value: "duchas", label: "Duchas" },
  { value: "cafeteria", label: "Cafetería/Bar" },
  { value: "restaurante", label: "Restaurante" },
  { value: "tienda-deportiva", label: "Tienda deportiva general" },
  { value: "gimnasio", label: "Gimnasio/Sala de fitness" },
  { value: "spa", label: "Spa/Wellness" },
  { value: "sauna", label: "Sauna" },
  { value: "piscina", label: "Piscina" },
  { value: "parking", label: "Parking" },
  { value: "wifi", label: "WiFi gratuito" },
  { value: "aire-acondicionado", label: "Aire acondicionado" },
  { value: "acceso-silla-ruedas", label: "Acceso para silla de ruedas" },
  { value: "zona-infantil", label: "Zona infantil" },
  { value: "sala-eventos", label: "Sala de eventos" }
]

export interface InstalacionFormData {
  businessName: string
  contactName: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  horarioApertura: string
  horarioCierre: string
  languages: string[]
  yearsExperience: string
  numberOfPadelCourts: string // OBLIGATORIO
  padelCourtTypes: string[]
  padelServices: string[] // Al menos uno OBLIGATORIO
  otherSports: string[]
  additionalFacilities: string[]
  // Redes sociales
  instagramUrl: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  avatarFile: File | null
  bannerFile: File | null
}

interface InstalacionFormProps {
  onSubmit: (data: InstalacionFormData) => void
  loading: boolean
}

export default function InstalacionForm({ onSubmit, loading }: InstalacionFormProps) {
  const [formData, setFormData] = useState<InstalacionFormData>({
    businessName: '',
    contactName: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    horarioApertura: '',
    horarioCierre: '',
    languages: [],
    yearsExperience: '',
    numberOfPadelCourts: '',
    padelCourtTypes: [],
    padelServices: [],
    otherSports: [],
    additionalFacilities: [],
    // Redes sociales
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    avatarFile: null,
    bannerFile: null
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof InstalacionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: keyof InstalacionFormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const handleImageUpload = (type: 'avatar' | 'banner', file: File) => {
    if (file) {
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
    }
  }

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

  const validateForm = () => {
    const hasRequiredFields = formData.businessName.trim() && 
                             formData.contactName.trim() && 
                             formData.address.trim() && 
                             formData.phone.trim()
    const hasSchedule = formData.horarioApertura && formData.horarioCierre
    const hasLanguages = formData.languages.length > 0
    
    // VALIDACIÓN ESPECÍFICA PARA PADEL
    const hasPadelCourts = formData.numberOfPadelCourts && parseInt(formData.numberOfPadelCourts) >= 1
    const hasPadelServices = formData.padelServices.length > 0
    
    return hasRequiredFields && hasSchedule && hasLanguages && hasPadelCourts && hasPadelServices
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
              Nombre de la instalación *
            </Label>
            <Input
              type="text"
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Ej: Centro Deportivo Malasaña"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
              Nombre del responsable *
            </Label>
            <Input
              type="text"
              id="contactName"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="Ej: Ana López"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Descripción de la instalación (opcional)
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe brevemente tu instalación deportiva..."
            className="w-full min-h-[80px] text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            Dirección *
          </Label>
          <Input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Ej: Calle Principal 123, Madrid"
            className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Teléfono *
            </Label>
            <Input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Ej: +34 123 456 789"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email (opcional)
            </Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Ej: info@centromalasana.com"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium text-gray-700">
              Sitio web (opcional)
            </Label>
            <Input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="Ej: https://www.centromalasana.com"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience" className="text-sm font-medium text-gray-700">
              Años de experiencia
            </Label>
            <select
              id="yearsExperience"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
              className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="">Seleccionar años de experiencia</option>
              {YEARS_EXPERIENCE.map((experience) => (
                <option key={experience.value} value={experience.value}>
                  {experience.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Horarios de funcionamiento */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Horarios de funcionamiento *</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="horarioApertura" className="text-sm font-medium text-gray-700">
              Hora de apertura
            </Label>
            <select
              id="horarioApertura"
              value={formData.horarioApertura}
              onChange={(e) => handleInputChange('horarioApertura', e.target.value)}
              className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Selecciona hora de apertura</option>
              {HORAS.map((hora) => (
                <option key={hora.value} value={hora.value}>
                  {hora.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="horarioCierre" className="text-sm font-medium text-gray-700">
              Hora de cierre
            </Label>
            <select
              id="horarioCierre"
              value={formData.horarioCierre}
              onChange={(e) => handleInputChange('horarioCierre', e.target.value)}
              className="w-full h-12 px-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Selecciona hora de cierre</option>
              {HORAS.map((hora) => (
                <option key={hora.value} value={hora.value}>
                  {hora.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: INSTALACIONES DE PADEL */}
      <div className="space-y-4 border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-emerald-900">Instalaciones de padel *</h3>
        </div>
        <p className="text-sm text-emerald-700 mb-4">
          Padelnity es para la comunidad padelista. Tu instalación debe ofrecer servicios de padel para poder registrarse.
        </p>
        
        {/* Número de pistas de padel */}
        <div className="space-y-2">
          <Label htmlFor="numberOfPadelCourts" className="text-sm font-medium text-emerald-800">
            Número de pistas de padel * (mínimo 1)
          </Label>
          <Input
            type="number"
            id="numberOfPadelCourts"
            min="1"
            max="50"
            value={formData.numberOfPadelCourts}
            onChange={(e) => handleInputChange('numberOfPadelCourts', e.target.value)}
            placeholder="Ej: 4"
            className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 border-emerald-300"
            required
          />
        </div>

        {/* Tipos de pistas de padel */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-emerald-800">
            Tipos de pistas de padel (opcional)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PADEL_COURT_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`padel-court-${type.value}`}
                  checked={formData.padelCourtTypes.includes(type.value)}
                  onCheckedChange={() => handleArrayToggle('padelCourtTypes', type.value)}
                  className="focus:ring-emerald-500 border-emerald-400"
                />
                <Label htmlFor={`padel-court-${type.value}`} className="text-sm text-emerald-800">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios de padel */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-emerald-800">
            Servicios de padel * (selecciona al menos uno)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PADEL_SERVICES.map((service) => (
              <div key={service.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`padel-service-${service.value}`}
                  checked={formData.padelServices.includes(service.value)}
                  onCheckedChange={() => handleArrayToggle('padelServices', service.value)}
                  className="focus:ring-emerald-500 border-emerald-400"
                />
                <Label htmlFor={`padel-service-${service.value}`} className="text-sm text-emerald-800">
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Otros deportes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Otros deportes y actividades</h3>
        <p className="text-sm text-gray-600">Selecciona otros deportes que ofreces además del padel</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {OTHER_SPORTS.map((sport) => (
            <div key={sport.value} className="flex items-center space-x-3">
              <Checkbox
                id={`sport-${sport.value}`}
                checked={formData.otherSports.includes(sport.value)}
                onCheckedChange={() => handleArrayToggle('otherSports', sport.value)}
                className="focus:ring-emerald-500"
              />
              <Label htmlFor={`sport-${sport.value}`} className="text-sm text-gray-700">
                {sport.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Instalaciones adicionales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Instalaciones adicionales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADDITIONAL_FACILITIES.map((facility) => (
            <div key={facility.value} className="flex items-center space-x-3">
              <Checkbox
                id={`facility-${facility.value}`}
                checked={formData.additionalFacilities.includes(facility.value)}
                onCheckedChange={() => handleArrayToggle('additionalFacilities', facility.value)}
                className="focus:ring-emerald-500"
              />
              <Label htmlFor={`facility-${facility.value}`} className="text-sm text-gray-700">
                {facility.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Idiomas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Idiomas de atención *</h3>
        <p className="text-sm text-gray-600">Selecciona los idiomas en los que puedes atender</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LANGUAGES.map((language) => (
            <div key={language.value} className="flex items-center space-x-3">
              <Checkbox
                id={`language-${language.value}`}
                checked={formData.languages.includes(language.value)}
                onCheckedChange={() => handleArrayToggle('languages', language.value)}
                className="focus:ring-emerald-500"
              />
              <Label htmlFor={`language-${language.value}`} className="text-sm text-gray-700">
                {language.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Redes sociales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Redes sociales (opcional)</h3>
        
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
              placeholder="Ej: instagram.com/instalacion o @instalacion"
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
              placeholder="Ej: facebook.com/instalacion"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterUrl" className="text-sm font-medium text-gray-700">
              Twitter/X
            </Label>
            <Input
              type="text"
              id="twitterUrl"
              value={formData.twitterUrl}
              onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
              placeholder="Ej: twitter.com/instalacion o @instalacion"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700">
              LinkedIn
            </Label>
            <Input
              type="text"
              id="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              placeholder="Ej: linkedin.com/company/instalacion"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Imágenes de la instalación */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Imágenes de la instalación</h3>
        
        {/* Avatar/Logo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Logo de la instalación (opcional)
          </Label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Logo preview" 
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
                <span>Subir logo</span>
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
            Imagen de portada de la instalación (opcional)
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
                    <p className="text-sm text-gray-500">Imagen de portada de la instalación</p>
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

      <Button
        type="submit"
        disabled={loading || !validateForm()}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            Configurando instalación...
          </div>
        ) : (
          'Completar configuración de la instalación'
        )}
      </Button>
    </form>
  )
}
