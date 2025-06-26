'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// Constantes específicas para Club de Padel
const HORAS = Array.from({ length: 24 }, (_, i) => {
  const hora = i.toString().padStart(2, '0')
  return { value: `${hora}:00`, label: `${hora}:00` }
})

const LANGUAGES = [
  { value: "espanol", label: "Español" },
  { value: "ingles", label: "Inglés" },
  { value: "frances", label: "Francés" },
  { value: "aleman", label: "Alemán" },
  { value: "italiano", label: "Italiano" },
  { value: "portugues", label: "Portugués" }
]

const RESERVATION_SYSTEMS = [
  { value: "telefono", label: "Teléfono" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "Página web" },
  { value: "aplicacion", label: "Aplicación móvil" }
]

const MAIN_SERVICES = [
  { value: "clases-particulares", label: "Clases particulares" },
  { value: "clases-grupales", label: "Clases grupales" },
  { value: "entrenamientos", label: "Entrenamientos" },
  { value: "torneos", label: "Torneos y competiciones" },
  { value: "alquiler-material", label: "Alquiler de material" },
  { value: "tienda-material", label: "Venta de material" },
  { value: "reparaciones", label: "Reparaciones" },
  { value: "eventos-corporativos", label: "Eventos corporativos" }
]

const COURT_TYPES = [
  { value: "cubiertas", label: "Pistas cubiertas" },
  { value: "descubiertas", label: "Pistas descubiertas" },
  { value: "cesped-artificial", label: "Césped artificial" },
  { value: "cristal", label: "Paredes de cristal" },
  { value: "hormigon", label: "Paredes de hormigón" }
]

const ADDITIONAL_FACILITIES = [
  { value: "vestuarios", label: "Vestuarios" },
  { value: "duchas", label: "Duchas" },
  { value: "cafeteria", label: "Cafetería/Bar" },
  { value: "tienda", label: "Tienda deportiva" },
  { value: "aparcamiento", label: "Aparcamiento propio" },
  { value: "aire-acondicionado", label: "Aire acondicionado" },
  { value: "calefaccion", label: "Calefacción" },
  { value: "wifi", label: "WiFi gratuito" },
  { value: "acceso-silla-ruedas", label: "Acceso para silla de ruedas" }
]

export interface ClubFormData {
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
  hasReservationSystem: boolean
  reservationSystems: string[]
  reservationDetails: {
    telefono: string
    whatsapp: string
    web: string
    aplicacion: string
  }
  numberOfCourts: string
  courtTypes: string[]
  mainServices: string[]
  additionalFacilities: string[]
  // Redes sociales
  instagramUrl: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  avatarFile: File | null
  bannerFile: File | null
}

interface ClubFormProps {
  onSubmit: (data: ClubFormData) => void
  loading: boolean
}

export default function ClubForm({ onSubmit, loading }: ClubFormProps) {
  const [formData, setFormData] = useState<ClubFormData>({
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
    hasReservationSystem: false,
    reservationSystems: [],
    reservationDetails: {
      telefono: '',
      whatsapp: '',
      web: '',
      aplicacion: ''
    },
    numberOfCourts: '',
    courtTypes: [],
    mainServices: [],
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

  const handleInputChange = (field: keyof ClubFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof ClubFormData] as any),
        [field]: value
      }
    }))
  }

  const handleArrayToggle = (field: keyof ClubFormData, value: string) => {
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
    
    return hasRequiredFields && hasSchedule && hasLanguages
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
              Nombre del club *
            </Label>
            <Input
              type="text"
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Ej: Club Padel Madrid"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
              Nombre de contacto *
            </Label>
            <Input
              type="text"
              id="contactName"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Descripción del club (opcional)
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe brevemente tu club de padel..."
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
              placeholder="Ej: info@clubpadel.com"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium text-gray-700">
            Sitio web (opcional)
          </Label>
          <Input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="Ej: https://www.clubpadel.com"
            className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
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

      {/* Información específica del club */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información específica del club</h3>
        
        {/* Número de pistas */}
        <div className="space-y-2">
          <Label htmlFor="numberOfCourts" className="text-sm font-medium text-gray-700">
            Número de pistas de pádel
          </Label>
          <Input
            type="number"
            id="numberOfCourts"
            min="1"
            max="50"
            value={formData.numberOfCourts}
            onChange={(e) => handleInputChange('numberOfCourts', e.target.value)}
            placeholder="Ej: 4"
            className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Tipo de pistas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Tipo de pistas (opcional)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {COURT_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`court-${type.value}`}
                  checked={formData.courtTypes.includes(type.value)}
                  onCheckedChange={() => handleArrayToggle('courtTypes', type.value)}
                  className="focus:ring-emerald-500"
                />
                <Label htmlFor={`court-${type.value}`} className="text-sm text-gray-700">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Servicios principales */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Servicios principales (opcional)
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {MAIN_SERVICES.map((service) => (
              <div key={service.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`service-${service.value}`}
                  checked={formData.mainServices.includes(service.value)}
                  onCheckedChange={() => handleArrayToggle('mainServices', service.value)}
                  className="focus:ring-emerald-500"
                />
                <Label htmlFor={`service-${service.value}`} className="text-sm text-gray-700">
                  {service.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Instalaciones adicionales */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Instalaciones adicionales (opcional)
          </Label>
          <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Idiomas */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Idiomas disponibles *
        </Label>
        <div className="grid grid-cols-2 gap-3">
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

      {/* Sistema de reservas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Sistema de reservas</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasReservationSystem"
            checked={formData.hasReservationSystem}
            onCheckedChange={(checked) => handleInputChange('hasReservationSystem', checked)}
            className="focus:ring-emerald-500"
          />
          <Label htmlFor="hasReservationSystem" className="text-sm text-gray-700">
            ¿Tienes sistema de reservas?
          </Label>
        </div>

        {formData.hasReservationSystem && (
          <div className="space-y-4 pl-6 border-l-2 border-emerald-200">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                ¿Cómo pueden reservar tus clientes?
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {RESERVATION_SYSTEMS.map((system) => (
                  <div key={system.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`reservation-${system.value}`}
                      checked={formData.reservationSystems.includes(system.value)}
                      onCheckedChange={() => handleArrayToggle('reservationSystems', system.value)}
                      className="focus:ring-emerald-500"
                    />
                    <Label htmlFor={`reservation-${system.value}`} className="text-sm text-gray-700">
                      {system.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalles de contacto para reservas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.reservationSystems.includes('telefono') && (
                <div className="space-y-2">
                  <Label htmlFor="reservationPhone" className="text-sm font-medium text-gray-700">
                    Teléfono para reservas
                  </Label>
                  <Input
                    type="tel"
                    id="reservationPhone"
                    value={formData.reservationDetails.telefono}
                    onChange={(e) => handleNestedInputChange('reservationDetails', 'telefono', e.target.value)}
                    placeholder="Ej: +34 123 456 789"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.reservationSystems.includes('whatsapp') && (
                <div className="space-y-2">
                  <Label htmlFor="reservationWhatsapp" className="text-sm font-medium text-gray-700">
                    WhatsApp para reservas
                  </Label>
                  <Input
                    type="tel"
                    id="reservationWhatsapp"
                    value={formData.reservationDetails.whatsapp}
                    onChange={(e) => handleNestedInputChange('reservationDetails', 'whatsapp', e.target.value)}
                    placeholder="Ej: +34 123 456 789"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.reservationSystems.includes('web') && (
                <div className="space-y-2">
                  <Label htmlFor="reservationWeb" className="text-sm font-medium text-gray-700">
                    Página web para reservas
                  </Label>
                  <Input
                    type="url"
                    id="reservationWeb"
                    value={formData.reservationDetails.web}
                    onChange={(e) => handleNestedInputChange('reservationDetails', 'web', e.target.value)}
                    placeholder="Ej: https://reservas.clubpadel.com"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.reservationSystems.includes('aplicacion') && (
                <div className="space-y-2">
                  <Label htmlFor="reservationApp" className="text-sm font-medium text-gray-700">
                    App para reservas
                  </Label>
                  <Input
                    type="text"
                    id="reservationApp"
                    value={formData.reservationDetails.aplicacion}
                    onChange={(e) => handleNestedInputChange('reservationDetails', 'aplicacion', e.target.value)}
                    placeholder="Ej: Club Padel App"
                    className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
              placeholder="Ej: instagram.com/clubpadel o @clubpadel"
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
              placeholder="Ej: facebook.com/clubpadel"
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
              placeholder="Ej: twitter.com/clubpadel o @clubpadel"
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
              placeholder="Ej: linkedin.com/company/clubpadel"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Imágenes del club */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Imágenes del club</h3>
        
        {/* Avatar/Logo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Logo del club (opcional)
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
            Imagen de portada del club (opcional)
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
                    <p className="text-sm text-gray-500">Imagen de portada del club</p>
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
            Configurando club...
          </div>
        ) : (
          'Completar configuración del club'
        )}
      </Button>
    </form>
  )
} 