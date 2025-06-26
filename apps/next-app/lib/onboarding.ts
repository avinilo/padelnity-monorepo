import { createClient } from '@/lib/supabase/client'

// Crear una sola instancia del cliente
const supabase = createClient()

// ===============================================
// TIPOS PARA FORMULARIOS DE ONBOARDING
// ===============================================

export interface PlayerFormData {
  fullName: string
  ubicacion?: string
  telefono?: string
  biografia?: string
  fechaNacimiento?: {
    dia: string
    mes: string
    año: string
  }
  manoDominante?: string
  nivel: string
  experiencia: string
  posicionFavorita: string
  estiloJuego?: string
  frecuenciaJuego?: string
  clubsHabituales?: string
  objetivos: string[]
  disponibilidad: string[]
  idiomas: string[]
  tiposCompañero: string[]
  // Redes sociales
  instagramUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  avatarUrl?: string
  bannerUrl?: string
}

// ===============================================
// TIPOS ESPECÍFICOS PARA CADA FORMULARIO DE NEGOCIO
// ===============================================

// Tipo base común para todos los negocios
export interface BaseBusinessFormData {
  businessType: string
  businessName: string
  contactName: string
  phone: string
  address: string
  email?: string
  website?: string
  description?: string
  horarioApertura: string
  horarioCierre: string
  languages: string[]
  mainServices: string[]
  additionalFacilities: string[]
  // Redes sociales
  instagramUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  avatarUrl?: string
  bannerUrl?: string
  avatarFile?: File
  bannerFile?: File
}

// Tipo específico para Clubes de Padel
export interface ClubFormData extends BaseBusinessFormData {
  businessType: 'club'
  hasReservationSystem: boolean
  reservationSystems: string[]
  reservationDetails: {
    telefono?: string
    whatsapp?: string
    web?: string
    aplicacion?: string
  }
  numberOfCourts: number
  courtTypes: string[]
}

// Tipo específico para Tiendas
export interface TiendaFormData extends BaseBusinessFormData {
  businessType: 'tienda'
  yearsExperience: string
  productCategories: string[]
  servicesOffered: string[]
  brandsAvailable: string[]
}

// Tipo específico para Academias
export interface AcademiaFormData extends BaseBusinessFormData {
  businessType: 'academia'
  yearsExperience: string
  teachingLevels: string[]
  classTypes: string[]
  instructorCertifications: string[]
}

// Tipo específico para Instalaciones Deportivas
export interface InstalacionFormData extends BaseBusinessFormData {
  businessType: 'instalacion'
  yearsExperience: string
  numberOfPadelCourts: number
  padelCourtTypes: string[]
  padelServices: string[]
  otherSports: string[]
}

// Tipo unión para todos los formularios de negocio
export type BusinessFormData = ClubFormData | TiendaFormData | AcademiaFormData | InstalacionFormData

// ===============================================
// FUNCIONES PARA JUGADORES
// ===============================================

export async function createPlayerProfile(userId: string, formData: PlayerFormData) {
  try {
    // Convertir fecha de nacimiento a formato ISO si está presente
    let fechaNacimiento = null
    if (formData.fechaNacimiento && formData.fechaNacimiento.dia && formData.fechaNacimiento.mes && formData.fechaNacimiento.año) {
      const { dia, mes, año } = formData.fechaNacimiento
      fechaNacimiento = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
    }

    const { data, error } = await supabase
      .from('players')
      .insert({
        user_id: userId,
        full_name: formData.fullName,
        ubicacion: formData.ubicacion,
        telefono: formData.telefono,
        biografia: formData.biografia,
        fecha_nacimiento: fechaNacimiento,
        mano_dominante: formData.manoDominante,
        nivel: formData.nivel,
        experiencia: formData.experiencia,
        posicion_favorita: formData.posicionFavorita,
        estilo_juego: formData.estiloJuego,
        frecuencia_juego: formData.frecuenciaJuego,
        clubs_habituales: formData.clubsHabituales,
        objetivos: formData.objetivos,
        disponibilidad: formData.disponibilidad,
        idiomas: formData.idiomas,
        tipos_compañero: formData.tiposCompañero,
        // Redes sociales
        instagram_url: formData.instagramUrl || null,
        facebook_url: formData.facebookUrl || null,
        twitter_url: formData.twitterUrl || null,
        avatar_url: formData.avatarUrl,
        banner_url: formData.bannerUrl,
        onboarding_complete: true
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating player profile:', error)
    return { success: false, error }
  }
}

// ===============================================
// FUNCIONES PARA NEGOCIOS
// ===============================================

export async function createBusinessProfile(userId: string, formData: BusinessFormData) {
  try {
    // Crear objeto base común para todas las tablas
    const baseData = {
      user_id: userId,
      business_name: formData.businessName,
      contact_name: formData.contactName,
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
      website: formData.website,
      description: formData.description,
      horario_apertura: formData.horarioApertura,
      horario_cierre: formData.horarioCierre,
      languages: formData.languages,
      main_services: formData.mainServices,
      additional_facilities: formData.additionalFacilities,
      avatar_url: formData.avatarUrl,
      banner_url: formData.bannerUrl,
      onboarding_complete: true
    }

    let finalData: any = {}
    let tableName = ''

    // Preparar datos específicos según el tipo de negocio
    switch (formData.businessType) {
      case 'club':
        const clubData = formData as ClubFormData
        tableName = 'clubs'
        finalData = {
          ...baseData,
          has_reservation_system: clubData.hasReservationSystem,
          reservation_systems: clubData.reservationSystems,
          // Mapear reservation_details a columnas individuales
          reservation_phone: clubData.reservationDetails?.telefono || null,
          reservation_whatsapp: clubData.reservationDetails?.whatsapp || null,
          reservation_web: clubData.reservationDetails?.web || null,
          reservation_app: clubData.reservationDetails?.aplicacion || null,
          number_of_courts: clubData.numberOfCourts,
          court_types: clubData.courtTypes,
          // Redes sociales
          instagram_url: clubData.instagramUrl || null,
          facebook_url: clubData.facebookUrl || null,
          twitter_url: clubData.twitterUrl || null,
          linkedin_url: clubData.linkedinUrl || null,
          verification_status: 'pending' // Los clubs tienen verificación
        }
        break

      case 'tienda':
        const tiendaData = formData as TiendaFormData
        tableName = 'tiendas'
        finalData = {
          ...baseData,
          years_experience: tiendaData.yearsExperience,
          product_categories: tiendaData.productCategories,
          services_offered: tiendaData.servicesOffered,
          brands_available: tiendaData.brandsAvailable,
          // Redes sociales
          instagram_url: tiendaData.instagramUrl || null,
          facebook_url: tiendaData.facebookUrl || null,
          twitter_url: tiendaData.twitterUrl || null,
          linkedin_url: tiendaData.linkedinUrl || null,
          verification_status: 'pending' // Las tiendas tienen verificación
        }
        break

      case 'academia':
        const academiaData = formData as AcademiaFormData
        tableName = 'academias'
        // Para academias, omitir onboarding_complete desde el inicio
        const { onboarding_complete, ...baseDataWithoutOnboarding } = baseData
        finalData = {
          ...baseDataWithoutOnboarding,
          years_experience: academiaData.yearsExperience,
          teaching_levels: academiaData.teachingLevels,
          class_types: academiaData.classTypes,
          instructor_certifications: academiaData.instructorCertifications,
          // Redes sociales
          instagram_url: academiaData.instagramUrl || null,
          facebook_url: academiaData.facebookUrl || null,
          twitter_url: academiaData.twitterUrl || null,
          linkedin_url: academiaData.linkedinUrl || null
          // Las academias NO tienen verification_status ni onboarding_complete
        }
        break

      case 'instalacion':
        const instalacionData = formData as InstalacionFormData
        tableName = 'instalaciones'
        // Para instalaciones, omitir onboarding_complete desde el inicio
        const { onboarding_complete: onboardingComplete, ...baseDataWithoutOnboardingInstall } = baseData
        finalData = {
          ...baseDataWithoutOnboardingInstall,
          years_experience: instalacionData.yearsExperience,
          number_of_padel_courts: instalacionData.numberOfPadelCourts,
          padel_court_types: instalacionData.padelCourtTypes,
          padel_services: instalacionData.padelServices,
          other_sports: instalacionData.otherSports,
          // Redes sociales
          instagram_url: instalacionData.instagramUrl || null,
          facebook_url: instalacionData.facebookUrl || null,
          twitter_url: instalacionData.twitterUrl || null,
          linkedin_url: instalacionData.linkedinUrl || null
          // Las instalaciones NO tienen verification_status ni onboarding_complete
        }
        break

      default:
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = formData
        throw new Error(`Tipo de negocio no soportado: ${(formData as any).businessType}`)
    }

    console.log('Datos finales a insertar en tabla:', tableName, finalData)

    const { data, error } = await supabase
      .from(tableName)
      .insert(finalData)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error creating business profile:', error)
    return { success: false, error }
  }
}

// ===============================================
// FUNCIONES ESPECÍFICAS POR TIPO DE NEGOCIO
// ===============================================

export async function createClubProfile(userId: string, formData: ClubFormData) {
  return createBusinessProfile(userId, formData)
}

export async function createTiendaProfile(userId: string, formData: TiendaFormData) {
  return createBusinessProfile(userId, formData)
}

export async function createAcademiaProfile(userId: string, formData: AcademiaFormData) {
  return createBusinessProfile(userId, formData)
}

export async function createInstalacionProfile(userId: string, formData: InstalacionFormData) {
  return createBusinessProfile(userId, formData)
}

// ===============================================
// FUNCIONES DE CONSULTA
// ===============================================

export async function getBusinessProfile(userId: string) {
  try {
    // Buscar en todas las tablas de negocios
    const tables = ['clubs', 'tiendas', 'academias', 'instalaciones']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        // Agregar el tipo de negocio basado en la tabla
        const businessType = table === 'clubs' ? 'club' : 
                           table === 'tiendas' ? 'tienda' :
                           table === 'academias' ? 'academia' : 'instalacion'
        
        return { success: true, data: { ...data, business_type: businessType } }
      }
    }

    // Si no se encuentra en ninguna tabla
    return { success: false, error: 'No business profile found' }
  } catch (error) {
    console.error('Error fetching business profile:', error)
    return { success: false, error }
  }
}

export async function getBusinessesByType(businessType: string) {
  try {
    // Mapear el tipo de negocio a la tabla correspondiente
    const tableMap = {
      'club': 'clubs',
      'tienda': 'tiendas', 
      'academia': 'academias',
      'instalacion': 'instalaciones'
    }

    const tableName = tableMap[businessType as keyof typeof tableMap]
    if (!tableName) {
      throw new Error(`Tipo de negocio no válido: ${businessType}`)
    }

    let query = supabase
      .from(tableName)
      .select('*')

    // Solo filtrar por verification_status si la tabla lo tiene (clubs y tiendas)
    if (tableName === 'clubs' || tableName === 'tiendas') {
      query = query.eq('verification_status', 'verified')
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    
    // Agregar el business_type a cada registro
    const dataWithType = data?.map(item => ({ ...item, business_type: businessType })) || []
    
    return { success: true, data: dataWithType }
  } catch (error) {
    console.error('Error fetching businesses by type:', error)
    return { success: false, error }
  }
}

export async function searchBusinesses(location?: string, services?: string[], businessTypes?: string[]) {
  try {
    const allResults: any[] = []
    
    // Definir qué tablas buscar según los tipos especificados
    const tableMap = {
      'club': 'clubs',
      'tienda': 'tiendas',
      'academia': 'academias', 
      'instalacion': 'instalaciones'
    }

    const tablesToSearch = businessTypes && businessTypes.length > 0
      ? businessTypes.map(type => tableMap[type as keyof typeof tableMap]).filter(Boolean)
      : Object.values(tableMap)

    // Buscar en cada tabla
    for (const tableName of tablesToSearch) {
      let query = supabase
        .from(tableName)
        .select('*')

      // Solo filtrar por verification_status si la tabla lo tiene
      if (tableName === 'clubs' || tableName === 'tiendas') {
        query = query.eq('verification_status', 'verified')
      }

      if (location) {
        query = query.ilike('address', `%${location}%`)
      }

      if (services && services.length > 0) {
        query = query.overlaps('main_services', services)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (data) {
        // Agregar business_type según la tabla
        const businessType = Object.keys(tableMap).find(key => tableMap[key as keyof typeof tableMap] === tableName)
        const dataWithType = data.map(item => ({ ...item, business_type: businessType }))
        allResults.push(...dataWithType)
      }
    }

    // Ordenar todos los resultados por fecha de creación
    allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return { success: true, data: allResults }
  } catch (error) {
    console.error('Error searching businesses:', error)
    return { success: false, error }
  }
}

// ===============================================
// FUNCIONES GENERALES
// ===============================================

export async function getOnboardingStatus(userId: string) {
  try {
    // Verificar si el usuario tiene un perfil de jugador
    const { data: playerProfile } = await supabase
      .from('players')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle()

    if (playerProfile?.onboarding_complete) {
      return { completed: true, type: 'player' }
    }

    // Verificar si el usuario tiene un perfil de negocio en cualquiera de las tablas
    const businessTables = ['clubs', 'tiendas', 'academias', 'instalaciones']
    
    for (const table of businessTables) {
      const { data: businessProfile } = await supabase
        .from(table)
        .select('onboarding_complete')
        .eq('user_id', userId)
        .maybeSingle()

      // Para clubs y tiendas verificar onboarding_complete
      // Para academias e instalaciones, solo verificar que exista el registro
      const isCompleted = (table === 'clubs' || table === 'tiendas') 
        ? businessProfile?.onboarding_complete 
        : !!businessProfile

      if (isCompleted) {
        return { completed: true, type: 'business' }
      }
    }

    return { completed: false, type: null }
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return { completed: false, type: null }
  }
}

// Función de utilidad para subir imágenes a Supabase Storage
export async function uploadImage(file: File, bucket: string, userId: string): Promise<{ success: boolean; url?: string; error?: any }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error }
  }
}

// ===============================================
// FUNCIONES DE MAPEO PARA COMPATIBILIDAD
// ===============================================

// Función para mapear datos de formularios antiguos al nuevo formato
export function mapToBusinessFormData(businessType: string, formData: any): BusinessFormData {
  const baseData = {
    businessType,
    businessName: formData.businessName || formData.nombre || '',
    contactName: formData.contactName || formData.nombreContacto || '',
    phone: formData.phone || formData.telefono || '',
    address: formData.address || formData.direccion || '',
    email: formData.email,
    website: formData.website || formData.sitioWeb,
    description: formData.description || formData.descripcion,
    horarioApertura: formData.horarioApertura || formData.horarioDesde || '09:00',
    horarioCierre: formData.horarioCierre || formData.horarioHasta || '22:00',
    languages: formData.languages || formData.idiomas || [],
    mainServices: formData.mainServices || formData.serviciosPrincipales || [],
    additionalFacilities: formData.additionalFacilities || formData.instalacionesAdicionales || [],
    avatarUrl: formData.avatarUrl,
    bannerUrl: formData.bannerUrl,
    avatarFile: formData.avatarFile,
    bannerFile: formData.bannerFile
  }

  switch (businessType) {
    case 'club':
      return {
        ...baseData,
        businessType: 'club',
        hasReservationSystem: formData.hasReservationSystem || false,
        reservationSystems: formData.reservationSystems || [],
        reservationDetails: formData.reservationDetails || {},
        numberOfCourts: formData.numberOfCourts || formData.numeroPistas || 1,
        courtTypes: formData.courtTypes || formData.tiposPistas || []
      } as ClubFormData

    case 'tienda':
      return {
        ...baseData,
        businessType: 'tienda',
        yearsExperience: formData.yearsExperience || formData.experiencia || '',
        productCategories: formData.productCategories || formData.categorias || [],
        servicesOffered: formData.servicesOffered || formData.servicios || [],
        brandsAvailable: formData.brandsAvailable || formData.marcas || []
      } as TiendaFormData

    case 'academia':
      return {
        ...baseData,
        businessType: 'academia',
        yearsExperience: formData.yearsExperience || formData.experiencia || '',
        teachingLevels: formData.teachingLevels || formData.nivelesEnsenanza || [],
        classTypes: formData.classTypes || formData.tiposClases || [],
        instructorCertifications: formData.instructorCertifications || formData.certificaciones || []
      } as AcademiaFormData

    case 'instalacion':
      return {
        ...baseData,
        businessType: 'instalacion',
        yearsExperience: formData.yearsExperience || formData.experiencia || '',
        numberOfPadelCourts: formData.numberOfPadelCourts || formData.pistasPadel || 1,
        padelCourtTypes: formData.padelCourtTypes || formData.tiposPistasPadel || [],
        padelServices: formData.padelServices || formData.serviciosPadel || [],
        otherSports: formData.otherSports || formData.otrosDeportes || []
      } as InstalacionFormData

    default:
      throw new Error(`Tipo de negocio no soportado: ${businessType}`)
  }
}