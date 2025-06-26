# ESQUEMA DE BASE DE DATOS - PADELNITY (REESTRUCTURADO)

## Resumen del Cambio

Hemos reestructurado completamente la base de datos de Padelnity, pasando de un enfoque de tabla única `businesses` a **5 tablas especializadas** que reflejan mejor los diferentes tipos de negocios de la comunidad padelista.

## Estructura Actualizada

### 1. **PLAYERS** (`01_tabla_players.sql`)
- **Propósito**: Tabla de jugadores de padel
- **Campos clave**: 
  - Información personal (full_name, ubicacion, telefono, biografia, fecha_nacimiento)
  - Perfil de jugador (mano_dominante, nivel, experiencia, posicion_favorita, estilo_juego)
  - Preferencias (frecuencia_juego, clubs_habituales, objetivos, disponibilidad)
  - Configuración social (idiomas, tipos_compañero)
- **Características**: Perfiles completos de jugadores, sistema de compatibilidad, búsqueda avanzada

### 2. **CLUBS** (`02_tabla_clubs.sql`)
- **Propósito**: Clubes de padel
- **Campos clave**: 
  - Información básica del club (business_name, contact_name, description, address)
  - Horarios y servicios (horarios completos, number_of_courts, main_services)
  - Sistema de reservas (has_reservation_system, reservation_systems)
  - Instalaciones (court_types, additional_facilities)
- **Características**: Búsqueda por servicios, tipos de pista, sistemas de reserva

### 3. **TIENDAS** (`03_tabla_tiendas.sql`)
- **Propósito**: Tiendas de material de padel
- **Campos clave**: 
  - Información comercial (business_name, contact_name, description, address)
  - Experiencia y especialización (years_experience, product_categories)
  - Servicios ofrecidos (services_offered, additional_facilities)
- **Características**: Búsqueda por productos, servicios, experiencia

### 4. **ACADEMIAS** (`04_tabla_academias.sql`)
- **Propósito**: Academias y escuelas de padel
- **Campos clave**: 
  - Información educativa (business_name, contact_name, years_experience)
  - Servicios educativos (main_services, languages)
  - Instalaciones (number_of_courts, additional_facilities)
- **Características**: Búsqueda por servicios educativos, idiomas, experiencia

### 5. **INSTALACIONES** (`05_tabla_instalaciones.sql`)
- **Propósito**: Instalaciones deportivas con enfoque en padel
- **Campos clave**: 
  - Información deportiva (business_name, contact_name, number_of_padel_courts)
  - Servicios de padel (padel_services, padel_court_types)
  - Deportes adicionales (other_sports, additional_facilities)
- **Características**: Búsqueda por número de pistas, servicios específicos, multideporte

## Características Técnicas Comunes

### Todas las tablas incluyen:
1. **Estructura base**: 
   - UUID como clave primaria
   - Referencia a `auth.users` para asociación de usuarios
   - Timestamps automáticos (`created_at`, `updated_at`)
   - Campo `is_active` para soft delete

2. **Validaciones robustas**:
   - Validaciones de email, teléfono, sitio web
   - Constraints para arrays JSONB
   - Verificación de contenido de campos específicos

3. **Índices optimizados**:
   - Índices GIN para búsquedas de texto completo
   - Índices JSONB para arrays
   - Índices de rendimiento para consultas frecuentes

4. **Políticas RLS (Row Level Security)**:
   - Acceso público a registros activos
   - Acceso privado a registros propios
   - Políticas para usuarios anónimos

5. **Funciones de utilidad**:
   - Búsqueda por ubicación
   - Búsqueda por servicios específicos
   - Funciones estadísticas

6. **Vistas especializadas**:
   - Vistas resumidas para listados
   - Vistas filtradas por características específicas
   - Vistas optimizadas para casos de uso comunes

## Orden de Ejecución

Para recrear la base de datos desde cero:

```sql
-- 1. Jugadores
\i 01_tabla_players.sql

-- 2. Clubes
\i 02_tabla_clubs.sql

-- 3. Tiendas
\i 03_tabla_tiendas.sql

-- 4. Academias
\i 04_tabla_academias.sql

-- 5. Instalaciones
\i 05_tabla_instalaciones.sql
```

## Ventajas del Nuevo Esquema

### 1. **Especialización por Tipo de Negocio**
- Cada tabla está optimizada para su tipo específico de negocio
- Campos relevantes y validaciones específicas
- Mejor organización y mantenibilidad

### 2. **Búsquedas Más Eficientes**
- Funciones de búsqueda especializadas para cada tipo
- Índices optimizados según los patrones de uso
- Vistas pre-filtradas para casos comunes

### 3. **Escalabilidad**
- Fácil agregar nuevos tipos de negocios
- Modificaciones independientes por tabla
- Mejor rendimiento con tablas más pequeñas

### 4. **Seguridad Mejorada**
- Políticas RLS específicas por tipo
- Validaciones más estrictas
- Control granular de acceso

### 5. **Experiencia de Usuario**
- Formularios específicos por tipo de negocio
- Campos relevantes para cada caso de uso
- Mejor UX en búsquedas y filtros

## Funciones de Búsqueda Disponibles

### Búsquedas Generales (todas las tablas):
- `buscar_[tipo]_por_ubicacion(termino)`
- `buscar_[tipo]_por_idioma(idioma)` (donde aplique)

### Búsquedas Específicas:

#### Players:
- `buscar_jugadores_por_nivel(nivel)`
- `buscar_jugadores_por_experiencia(años)`
- `buscar_jugadores_compatibles(player_id)`

#### Clubs:
- `buscar_clubs_por_servicios(servicios[])`
- `buscar_clubs_con_reservas()`
- `buscar_clubs_por_tipo_pista(tipo)`

#### Tiendas:
- `buscar_tiendas_por_productos(productos[])`
- `buscar_tiendas_por_servicios(servicios[])`

#### Academias:
- `buscar_academias_por_servicios(servicios[])`
- `buscar_academias_por_idioma(idioma)`

#### Instalaciones:
- `buscar_instalaciones_por_servicios_padel(servicios[])`
- `buscar_instalaciones_por_pistas(min, max)`
- `buscar_instalaciones_multideporte()`

## Vistas Especializadas

### Ejemplos de vistas disponibles:
- `vista_[tipo]_resumen`: Información resumida para listados
- `vista_clubs_con_reservas`: Clubes con sistema de reservas
- `vista_instalaciones_grandes`: Instalaciones con 6+ pistas
- `vista_academias_competicion`: Academias enfocadas en competición
- `vista_tiendas_especializadas`: Tiendas con servicios avanzados

## Migración de Datos

Si necesitas migrar de la estructura antigua:

1. **Backup de datos existentes**
2. **Ejecutar los nuevos scripts**
3. **Migrar datos según el tipo de negocio**:
   - Filtrar por `business_type`
   - Mapear campos según la nueva estructura
   - Validar datos migrados

## Storage de Imágenes

Todas las tablas soportan:
- `avatar_url`: Logo/imagen de perfil
- `banner_url`: Imagen de portada

Los buckets de Supabase Storage están configurados para:
- `avatars`: Imágenes de perfil
- `banners`: Imágenes de portada

## Verificación de Instalación

Cada script incluye funciones de verificación que confirman:
- ✅ Tabla creada correctamente
- ✅ Índices aplicados
- ✅ Políticas RLS habilitadas
- ✅ Funciones y vistas creadas

## Notas Importantes

1. **Datos de prueba**: Cada script incluye datos de ejemplo comentados
2. **Extensiones necesarias**: `uuid-ossp`, `pg_trgm`, `unaccent`
3. **Compatibilidad**: Compatible con Supabase y PostgreSQL 13+
4. **Rendimiento**: Optimizado para consultas frecuentes

---

**Creado por**: Sistema de reestructuración de Padelnity  
**Fecha**: 2024  
**Versión**: 2.0 - Esquema especializado por tipos de negocio 