# 🏢 Configuración de Formularios de Negocios - Padelnity

## 📋 Resumen

Este documento explica cómo configurar la base de datos de Supabase para soportar los 4 tipos de formularios de negocios en Padelnity:

1. **Club de Padel** - Clubes especializados en padel con pistas propias
2. **Tienda de Material** - Venta de material deportivo y accesorios
3. **Academia/Escuela** - Enseñanza y entrenamiento de padel
4. **Instalación Deportiva** - Centros deportivos multidisciplinares con padel

## 🚀 Instalación

### Paso 1: Ejecutar Script SQL

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido completo de `database_schema_business_forms.sql`
4. Ejecuta el script
5. Verifica que no hay errores

### Paso 2: Verificar Instalación

Ejecuta esta consulta para verificar que todo está correctamente configurado:

```sql
SELECT * FROM check_business_forms_setup();
```

Deberías ver algo como:

| component | status | details |
|-----------|---------|---------|
| Tabla businesses | OK | Tabla creada correctamente |
| Columnas específicas | OK | Todas las columnas específicas existen |
| Row Level Security | OK | RLS habilitado |
| Storage Buckets | OK | Buckets avatars y banners existen |
| Vistas específicas | OK | Vistas para cada tipo de negocio creadas |
| Restricciones | OK | Restricción de padel para instalaciones activa |

## 📊 Estructura de la Base de Datos

### Tabla Principal: `businesses`

La tabla `businesses` almacena todos los tipos de negocios con campos específicos para cada tipo:

#### Campos Comunes (todos los negocios)
- `id` - UUID único
- `user_id` - Referencia al usuario de auth
- `business_type` - Tipo: 'club', 'tienda', 'academia', 'instalacion'
- `business_name` - Nombre del negocio
- `contact_name` - Nombre de contacto
- `description` - Descripción del negocio
- `address` - Dirección completa
- `phone` - Teléfono de contacto
- `email` - Email (opcional)
- `website` - Sitio web (opcional)
- `horario_apertura` - Hora de apertura (formato: "09:00")
- `horario_cierre` - Hora de cierre (formato: "22:00")
- `languages` - Idiomas soportados (JSONB array)
- `main_services` - Servicios principales (JSONB array)
- `additional_facilities` - Instalaciones adicionales (JSONB array)
- `avatar_url` - URL del logo
- `banner_url` - URL de la imagen de portada

#### Campos Específicos para Clubes de Padel
- `has_reservation_system` - Si tiene sistema de reservas
- `reservation_systems` - Tipos de reserva: ["telefono", "whatsapp", "web", "aplicacion"]
- `reservation_details` - Detalles de contacto para reservas (JSONB object)
- `number_of_courts` - Número de pistas de padel
- `court_types` - Tipos de pistas: ["cubiertas", "descubiertas", "cristal", "hormigon"]

#### Campos Específicos para Tiendas
- `years_experience` - Años de experiencia
- `product_categories` - Categorías: ["palas", "pelotas", "ropa", "calzado", "accesorios"]
- `services_offered` - Servicios: ["venta", "reparacion", "encordado", "personalizacion"]
- `brands_available` - Marcas disponibles: ["adidas", "head", "bullpadel", "nox"]

#### Campos Específicos para Academias
- `years_experience` - Años de experiencia
- `teaching_levels` - Niveles: ["principiante", "intermedio", "avanzado", "competicion"]
- `class_types` - Tipos de clases: ["individuales", "grupales", "intensivos", "campus"]
- `instructor_certifications` - Certificaciones: ["fep", "ipta", "ppt", "otros"]

#### Campos Específicos para Instalaciones Deportivas
- `years_experience` - Años de experiencia
- `number_of_padel_courts` - Número de pistas de padel (OBLIGATORIO ≥ 1)
- `padel_court_types` - Tipos de pistas de padel (JSONB array)
- `padel_services` - Servicios de padel (JSONB array, OBLIGATORIO)
- `other_sports` - Otros deportes: ["tenis", "futbol-sala", "baloncesto", "squash"]

### Vistas Especializadas

El script crea vistas específicas para cada tipo de negocio:

- `club_profiles` - Solo campos relevantes para clubes
- `tienda_profiles` - Solo campos relevantes para tiendas
- `academia_profiles` - Solo campos relevantes para academias
- `instalacion_profiles` - Solo campos relevantes para instalaciones

## 🔧 Uso en la Aplicación

### Tipos TypeScript

El archivo `lib/onboarding.ts` incluye tipos específicos para cada formulario:

```typescript
// Tipo base común
interface BaseBusinessFormData {
  businessType: string
  businessName: string
  contactName: string
  // ... campos comunes
}

// Tipos específicos
interface ClubFormData extends BaseBusinessFormData {
  businessType: 'club'
  hasReservationSystem: boolean
  reservationSystems: string[]
  numberOfCourts: number
  // ... campos específicos de club
}

interface TiendaFormData extends BaseBusinessFormData {
  businessType: 'tienda'
  yearsExperience: string
  productCategories: string[]
  // ... campos específicos de tienda
}

// Y así para academia e instalacion...
```

### Funciones de Creación

```typescript
// Función general que maneja todos los tipos
await createBusinessProfile(userId, formData)

// Funciones específicas (opcionales)
await createClubProfile(userId, clubFormData)
await createTiendaProfile(userId, tiendaFormData)
await createAcademiaProfile(userId, academiaFormData)
await createInstalacionProfile(userId, instalacionFormData)
```

### Funciones de Consulta

```typescript
// Obtener perfil de negocio del usuario
const profile = await getBusinessProfile(userId)

// Obtener negocios por tipo
const clubs = await getBusinessesByType('club')

// Búsqueda avanzada
const results = await searchBusinesses(
  'Madrid',                    // ubicación
  ['clases-particulares'],     // servicios
  ['club', 'academia']         // tipos de negocio
)
```

## 🔍 Funciones de Utilidad SQL

### Estadísticas de Negocios

```sql
SELECT * FROM get_business_stats();
```

Devuelve:
| business_type | total_count | verified_count | pending_count |
|---------------|-------------|----------------|---------------|
| club          | 15          | 12             | 3             |
| tienda        | 8           | 6              | 2             |
| academia      | 10          | 8              | 2             |
| instalacion   | 5           | 4              | 1             |

### Búsqueda de Negocios

```sql
-- Buscar clubes en Madrid con clases particulares
SELECT * FROM search_businesses(
  'Madrid', 
  ARRAY['clases-particulares'], 
  ARRAY['club']
);

-- Buscar todas las tiendas
SELECT * FROM search_businesses(
  '', 
  ARRAY[]::TEXT[], 
  ARRAY['tienda']
);
```

## 🛡️ Seguridad y Políticas

### Row Level Security (RLS)

- ✅ **Habilitado** en la tabla `businesses`
- ✅ Los usuarios solo pueden ver/editar sus propios perfiles
- ✅ Inserción solo para usuarios autenticados
- ✅ Actualización solo del propio perfil

### Storage Policies

- ✅ **Avatars** y **banners** públicamente accesibles para lectura
- ✅ Subida solo para el propio usuario (carpeta por user_id)
- ✅ Límites de tamaño: 5MB avatars, 10MB banners
- ✅ Formatos permitidos: JPEG, PNG, WebP

## 📏 Validaciones y Restricciones

### Validaciones Automáticas

1. **Formato de horarios**: Debe ser formato HH:MM (ej: "09:00")
2. **Tipos de negocio**: Solo 'club', 'tienda', 'academia', 'instalacion'
3. **Estado de verificación**: Solo 'pending', 'verified', 'rejected'
4. **Instalaciones deportivas**: DEBEN tener al menos 1 pista de padel

### Restricciones Específicas

```sql
-- Las instalaciones DEBEN tener padel
CONSTRAINT instalacion_must_have_padel CHECK (
  business_type != 'instalacion' OR 
  (number_of_padel_courts >= 1 AND jsonb_array_length(padel_services) > 0)
)
```

## 🚨 Troubleshooting

### Error: "Tabla no encontrada"
- Asegúrate de ejecutar el script SQL completo
- Verifica que tienes permisos de administrador en Supabase

### Error: "RLS no habilitado"
- El script habilita RLS automáticamente
- Si persiste, ejecuta: `ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;`

### Error: "Storage buckets no existen"
- Los buckets se crean automáticamente
- Si fallan, créalos manualmente en Storage > Buckets

### Error: "Instalación sin pistas de padel"
- Las instalaciones deportivas DEBEN tener al menos 1 pista de padel
- Verifica que `numberOfPadelCourts >= 1` y `padelServices` no esté vacío

## 📈 Monitoreo y Mantenimiento

### Consultas Útiles

```sql
-- Ver todos los negocios por tipo
SELECT business_type, COUNT(*) FROM businesses GROUP BY business_type;

-- Ver negocios pendientes de verificación
SELECT business_name, business_type, created_at 
FROM businesses 
WHERE verification_status = 'pending'
ORDER BY created_at DESC;

-- Ver uso de storage
SELECT bucket_id, COUNT(*), 
       pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects 
WHERE bucket_id IN ('avatars', 'banners')
GROUP BY bucket_id;
```

### Backup y Restauración

```sql
-- Crear backup antes de cambios importantes
CREATE TABLE businesses_backup_YYYYMMDD AS SELECT * FROM businesses;

-- Restaurar desde backup si es necesario
-- (¡CUIDADO! Esto elimina datos actuales)
-- TRUNCATE businesses;
-- INSERT INTO businesses SELECT * FROM businesses_backup_YYYYMMDD;
```

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado sin errores
- [ ] Función `check_business_forms_setup()` devuelve todo OK
- [ ] Buckets de storage creados (avatars, banners)
- [ ] RLS habilitado en tabla businesses
- [ ] Políticas de storage configuradas
- [ ] Vistas específicas creadas
- [ ] Restricciones de validación activas
- [ ] Tipos TypeScript actualizados en la aplicación
- [ ] Funciones de onboarding funcionando correctamente

## 🎯 Próximos Pasos

1. **Prueba los formularios** en desarrollo
2. **Verifica la subida de imágenes** funciona correctamente
3. **Implementa búsqueda avanzada** usando las funciones SQL
4. **Configura verificación** de negocios (cambiar status a 'verified')
5. **Implementa notificaciones** para nuevos registros de negocio

---

**¡Listo!** Tu base de datos de Supabase ahora soporta completamente los 4 tipos de formularios de negocios de Padelnity con toda la funcionalidad avanzada incluida. 