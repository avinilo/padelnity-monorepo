'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// Constantes específicas para Tienda de Material
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

const PRODUCT_CATEGORIES = [
  { value: "todo", label: "Todo tipo de material de padel" },
  { value: "palas", label: "Palas de padel" },
  { value: "pelotas", label: "Pelotas" },
  { value: "ropa-deportiva", label: "Ropa deportiva" },
  { value: "calzado", label: "Calzado deportivo" },
  { value: "complementos", label: "Complementos y accesorios" },
  { value: "mochilas-bolsas", label: "Mochilas y bolsas" },
  { value: "grips-overgrips", label: "Grips y overgrips" },
  { value: "protectores", label: "Protectores de pala" },
  { value: "raqueteros", label: "Raqueteros" },
  { value: "muñequeras", label: "Muñequeras y cintas" }
]

const SERVICES_OFFERED = [
  { value: "venta-presencial", label: "Venta presencial" },
  { value: "venta-online", label: "Venta online" },
  { value: "asesoramiento", label: "Asesoramiento personalizado" },
  { value: "prueba-palas", label: "Prueba de palas" },
  { value: "personalizacion", label: "Personalización de material" },
  { value: "mantenimiento", label: "Mantenimiento y reparaciones" },
  { value: "cambio-grip", label: "Cambio de grip" },
  { value: "servicio-tecnico", label: "Servicio técnico" },
  { value: "entrega-domicilio", label: "Entrega a domicilio" },
  { value: "recogida-tienda", label: "Recogida en tienda" }
]

const ADDITIONAL_FACILITIES = [
  { value: "probador", label: "Probador" },
  { value: "zona-pruebas", label: "Zona de pruebas de palas" },
  { value: "aparcamiento", label: "Parking" },
  { value: "aire-acondicionado", label: "Aire acondicionado" },
  { value: "wifi", label: "WiFi gratuito" },
  { value: "acceso-silla-ruedas", label: "Acceso para silla de ruedas" },
  { value: "tarjeta-credito", label: "Pago con tarjeta" },
  { value: "bizum", label: "Pago con Bizum" },
  { value: "transferencia", label: "Transferencia bancaria" }
]

export interface TiendaFormData {
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
  productCategories: string[]
  servicesOffered: string[]
  additionalFacilities: string[]
  yearsExperience: string
  // Redes sociales
  instagramUrl: string
  facebookUrl: string
  twitterUrl: string
  linkedinUrl: string
  avatarFile: File | null
  bannerFile: File | null
}

interface TiendaFormProps {
  onSubmit: (data: TiendaFormData) => void
  loading: boolean
}

export default function TiendaForm({ onSubmit, loading }: TiendaFormProps) {
  const [formData, setFormData] = useState<TiendaFormData>({
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
    productCategories: [],
    servicesOffered: [],
    additionalFacilities: [],
    yearsExperience: '',
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

  const handleInputChange = (field: keyof TiendaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: keyof TiendaFormData, value: string) => {
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
    const hasProducts = formData.productCategories.length > 0
    
    return hasRequiredFields && hasSchedule && hasLanguages && hasProducts
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Información Básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nombre de la tienda *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="ej. PadelShop Madrid"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nombre del responsable *</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="ej. Juan Pérez"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción de la tienda</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe tu tienda, especialidades, qué la hace especial..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección completa *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="ej. Calle Gran Vía 123, Madrid"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="ej. +34 123 456 789"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email de contacto</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="ej. info@tienda.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Página web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="ej. www.tienda.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Años de experiencia</Label>
            <select
              id="yearsExperience"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
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

      {/* Horarios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Horarios de Funcionamiento
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="horarioApertura">Hora de apertura *</Label>
            <select
              id="horarioApertura"
              value={formData.horarioApertura}
              onChange={(e) => handleInputChange('horarioApertura', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Seleccionar hora</option>
              {HORAS.map((hora) => (
                <option key={hora.value} value={hora.value}>
                  {hora.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarioCierre">Hora de cierre *</Label>
            <select
              id="horarioCierre"
              value={formData.horarioCierre}
              onChange={(e) => handleInputChange('horarioCierre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Seleccionar hora</option>
              {HORAS.map((hora) => (
                <option key={hora.value} value={hora.value}>
                  {hora.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Productos y Categorías *
        </h3>
        <p className="text-sm text-gray-600">Selecciona las categorías de productos que vendes</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={category.value}
                checked={formData.productCategories.includes(category.value)}
                onCheckedChange={() => handleArrayToggle('productCategories', category.value)}
              />
              <Label htmlFor={category.value} className="text-sm">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Servicios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Servicios Ofrecidos
        </h3>
        <p className="text-sm text-gray-600">Selecciona los servicios que ofreces</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SERVICES_OFFERED.map((service) => (
            <div key={service.value} className="flex items-center space-x-2">
              <Checkbox
                id={service.value}
                checked={formData.servicesOffered.includes(service.value)}
                onCheckedChange={() => handleArrayToggle('servicesOffered', service.value)}
              />
              <Label htmlFor={service.value} className="text-sm">
                {service.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Instalaciones y Facilidades */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Instalaciones y Facilidades
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ADDITIONAL_FACILITIES.map((facility) => (
            <div key={facility.value} className="flex items-center space-x-2">
              <Checkbox
                id={facility.value}
                checked={formData.additionalFacilities.includes(facility.value)}
                onCheckedChange={() => handleArrayToggle('additionalFacilities', facility.value)}
              />
              <Label htmlFor={facility.value} className="text-sm">
                {facility.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Idiomas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Idiomas de Atención *
        </h3>
        <p className="text-sm text-gray-600">Selecciona los idiomas en los que puedes atender a los clientes</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LANGUAGES.map((language) => (
            <div key={language.value} className="flex items-center space-x-2">
              <Checkbox
                id={language.value}
                checked={formData.languages.includes(language.value)}
                onCheckedChange={() => handleArrayToggle('languages', language.value)}
              />
              <Label htmlFor={language.value} className="text-sm">
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
              placeholder="Ej: instagram.com/mitienda o @mitienda"
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
              placeholder="Ej: facebook.com/mitienda"
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
              placeholder="Ej: twitter.com/mitienda o @mitienda"
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
              placeholder="Ej: linkedin.com/company/mitienda"
              className="w-full h-12 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Imágenes de la tienda */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Imágenes de la tienda</h3>
        
        {/* Avatar/Logo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Logo de la tienda (opcional)
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
            Imagen de portada de la tienda (opcional)
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
                    <p className="text-sm text-gray-500">Imagen de portada de la tienda</p>
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

      {/* Botón de envío */}
      <Button
        type="submit"
        disabled={loading || !validateForm()}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            Configurando tienda...
          </div>
        ) : (
          'Completar configuración de la tienda'
        )}
      </Button>
    </form>
  )
} 