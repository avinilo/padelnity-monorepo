-- ===============================================
-- TABLA CLUBS - CLUBES DE PADEL
-- ===============================================
-- Esta tabla almacena todos los perfiles de clubes de padel de Padelnity
-- Incluye todos los campos del formulario de onboarding de clubes
-- 
-- EJECUTAR DESPUÉS DE: 01_tabla_players.sql
-- ===============================================

-- ===============================================
-- 1. EXTENSIONES NECESARIAS (SI NO ESTÁN)
-- ===============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 2. BACKUP DE DATOS EXISTENTES (SI EXISTEN)
-- ===============================================

DO $$
BEGIN
    -- Verificar si la tabla existe y tiene datos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') THEN
        IF EXISTS (SELECT 1 FROM clubs LIMIT 1) THEN
            CREATE TABLE IF NOT EXISTS clubs_backup AS SELECT * FROM clubs;
            RAISE NOTICE 'Backup creado en clubs_backup';
        END IF;
    END IF;
END $$;

-- ===============================================
-- 3. ELIMINAR TABLA EXISTENTE SI EXISTE
-- ===============================================

DROP TABLE IF EXISTS public.clubs CASCADE;

-- ===============================================
-- 4. CREAR TABLA CLUBS COMPLETA
-- ===============================================

CREATE TABLE public.clubs (
    -- ===============================================
    -- IDENTIFICACIÓN Y CONTROL
    -- ===============================================
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ===============================================
    -- INFORMACIÓN BÁSICA DEL NEGOCIO
    -- ===============================================
    business_name VARCHAR(200) NOT NULL,          -- Nombre del club
    contact_name VARCHAR(100) NOT NULL,           -- Nombre de contacto
    description TEXT,                             -- Descripción del club
    address TEXT NOT NULL,                        -- Dirección completa
    phone VARCHAR(20) NOT NULL,                   -- Teléfono principal
    email VARCHAR(100),                           -- Email del club
    website VARCHAR(255),                         -- Página web del club
    
    -- ===============================================
    -- HORARIOS DE OPERACIÓN
    -- ===============================================
    horario_apertura TIME NOT NULL,               -- Hora de apertura (formato HH:MM)
    horario_cierre TIME NOT NULL,                 -- Hora de cierre (formato HH:MM)
    
    -- ===============================================
    -- INFORMACIÓN ESPECÍFICA DEL CLUB
    -- ===============================================
    number_of_courts INTEGER,                     -- Número de pistas de padel
    
    -- ===============================================
    -- ARRAYS DE CONFIGURACIÓN (JSONB)
    -- ===============================================
    -- Idiomas disponibles: ["espanol", "ingles", "frances", "aleman", "italiano", "portugues"]
    languages JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Tipos de pistas: ["cubiertas", "descubiertas", "cesped-artificial", "cristal", "hormigon"]
    court_types JSONB DEFAULT '[]'::jsonb,
    
    -- Servicios principales: ["clases-particulares", "clases-grupales", "entrenamientos", "torneos", "alquiler-material", "tienda-material", "reparaciones", "eventos-corporativos"]
    main_services JSONB DEFAULT '[]'::jsonb,
    
    -- Instalaciones adicionales: ["vestuarios", "duchas", "cafeteria", "tienda", "aparcamiento", "aire-acondicionado", "calefaccion", "wifi", "acceso-silla-ruedas"]
    additional_facilities JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- SISTEMA DE RESERVAS
    -- ===============================================
    has_reservation_system BOOLEAN DEFAULT FALSE, -- Si tiene sistema de reservas
    
    -- Métodos de reserva: ["telefono", "whatsapp", "web", "aplicacion"]
    reservation_systems JSONB DEFAULT '[]'::jsonb,
    
    -- Detalles específicos de contacto para reservas
    reservation_phone VARCHAR(20),                -- Teléfono específico para reservas
    reservation_whatsapp VARCHAR(20),             -- WhatsApp para reservas
    reservation_web VARCHAR(255),                 -- URL web para reservas
    reservation_app VARCHAR(100),                 -- Nombre de la app para reservas
    
    -- ===============================================
    -- IMÁGENES DEL CLUB
    -- ===============================================
    avatar_url TEXT,                              -- URL del logo del club
    banner_url TEXT,                              -- URL de la imagen de portada del club
    
    -- ===============================================
    -- CONTROL Y ESTADO
    -- ===============================================
    onboarding_complete BOOLEAN DEFAULT FALSE,    -- Si completó el proceso de registro
    is_active BOOLEAN DEFAULT TRUE,               -- Si el club está activo
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'draft')),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    
    -- ===============================================
    -- TIMESTAMPS
    -- ===============================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ===============================================
    -- RESTRICCIONES Y VALIDACIONES
    -- ===============================================
    CONSTRAINT unique_user_club UNIQUE(user_id),
    CONSTRAINT valid_business_name CHECK (length(trim(business_name)) >= 2),
    CONSTRAINT valid_contact_name CHECK (length(trim(contact_name)) >= 2),
    CONSTRAINT valid_phone_format CHECK (phone ~ '^\+?[0-9\s\-\(\)]{7,}$'),
    CONSTRAINT valid_email_format CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_website_format CHECK (website IS NULL OR website ~ '^https?://'),
    CONSTRAINT valid_reservation_phone CHECK (reservation_phone IS NULL OR reservation_phone ~ '^\+?[0-9\s\-\(\)]{7,}$'),
    CONSTRAINT valid_reservation_whatsapp CHECK (reservation_whatsapp IS NULL OR reservation_whatsapp ~ '^\+?[0-9\s\-\(\)]{7,}$'),
    CONSTRAINT valid_reservation_web CHECK (reservation_web IS NULL OR reservation_web ~ '^https?://'),
    CONSTRAINT valid_horarios CHECK (horario_apertura < horario_cierre),
    CONSTRAINT valid_courts_number CHECK (number_of_courts IS NULL OR (number_of_courts > 0 AND number_of_courts <= 50)),
    CONSTRAINT valid_languages_array CHECK (jsonb_typeof(languages) = 'array'),
    CONSTRAINT valid_court_types_array CHECK (jsonb_typeof(court_types) = 'array'),
    CONSTRAINT valid_main_services_array CHECK (jsonb_typeof(main_services) = 'array'),
    CONSTRAINT valid_additional_facilities_array CHECK (jsonb_typeof(additional_facilities) = 'array'),
    CONSTRAINT valid_reservation_systems_array CHECK (jsonb_typeof(reservation_systems) = 'array')
);

-- ===============================================
-- 5. COMENTARIOS EXPLICATIVOS
-- ===============================================

COMMENT ON TABLE clubs IS 'Perfiles de clubes de padel registrados en Padelnity';
COMMENT ON COLUMN clubs.business_name IS 'Nombre comercial del club de padel';
COMMENT ON COLUMN clubs.contact_name IS 'Nombre de la persona de contacto';
COMMENT ON COLUMN clubs.number_of_courts IS 'Número total de pistas de padel disponibles';
COMMENT ON COLUMN clubs.languages IS 'Array JSON con idiomas atendidos en el club';
COMMENT ON COLUMN clubs.court_types IS 'Array JSON con tipos de pistas disponibles';
COMMENT ON COLUMN clubs.main_services IS 'Array JSON con servicios principales del club';
COMMENT ON COLUMN clubs.additional_facilities IS 'Array JSON con instalaciones adicionales';
COMMENT ON COLUMN clubs.has_reservation_system IS 'Indica si el club tiene sistema de reservas';
COMMENT ON COLUMN clubs.reservation_systems IS 'Array JSON con métodos de reserva disponibles';

-- ===============================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_clubs_user_id ON clubs(user_id);
CREATE INDEX IF NOT EXISTS idx_clubs_business_name ON clubs(business_name);
CREATE INDEX IF NOT EXISTS idx_clubs_onboarding ON clubs(onboarding_complete);
CREATE INDEX IF NOT EXISTS idx_clubs_is_active ON clubs(is_active);
CREATE INDEX IF NOT EXISTS idx_clubs_visibility ON clubs(visibility);
CREATE INDEX IF NOT EXISTS idx_clubs_verification_status ON clubs(verification_status);

-- Índices para búsquedas geográficas
CREATE INDEX IF NOT EXISTS idx_clubs_address ON clubs USING gin(to_tsvector('spanish', address));

-- Índices para características del club
CREATE INDEX IF NOT EXISTS idx_clubs_courts_number ON clubs(number_of_courts) WHERE number_of_courts IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clubs_has_reservation ON clubs(has_reservation_system);

-- Índices para búsquedas por arrays JSONB
CREATE INDEX IF NOT EXISTS idx_clubs_languages ON clubs USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_clubs_court_types ON clubs USING gin(court_types);
CREATE INDEX IF NOT EXISTS idx_clubs_main_services ON clubs USING gin(main_services);
CREATE INDEX IF NOT EXISTS idx_clubs_additional_facilities ON clubs USING gin(additional_facilities);
CREATE INDEX IF NOT EXISTS idx_clubs_reservation_systems ON clubs USING gin(reservation_systems);

-- Índices compuestos para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_clubs_active_verified ON clubs(is_active, verification_status) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_clubs_active_address ON clubs(is_active, address) WHERE visibility = 'public';

-- Índices de timestamp
CREATE INDEX IF NOT EXISTS idx_clubs_created_at ON clubs(created_at);
CREATE INDEX IF NOT EXISTS idx_clubs_last_active ON clubs(last_active);

-- Índice para búsquedas de texto completo
CREATE INDEX IF NOT EXISTS idx_clubs_search_text ON clubs USING gin(
    to_tsvector('spanish', 
        coalesce(business_name, '') || ' ' || 
        coalesce(description, '') || ' ' || 
        coalesce(address, '')
    )
);

-- ===============================================
-- 7. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ===============================================

CREATE OR REPLACE FUNCTION update_clubs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- También actualizar last_active si cambió información relevante
    IF OLD.onboarding_complete != NEW.onboarding_complete OR 
       OLD.is_active != NEW.is_active OR
       OLD.verification_status != NEW.verification_status THEN
        NEW.last_active = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 8. TRIGGER PARA TIMESTAMPS AUTOMÁTICOS
-- ===============================================

DROP TRIGGER IF EXISTS update_clubs_updated_at_trigger ON clubs;
CREATE TRIGGER update_clubs_updated_at_trigger
    BEFORE UPDATE ON clubs
    FOR EACH ROW
    EXECUTE FUNCTION update_clubs_updated_at();

-- ===============================================
-- 9. HABILITAR ROW LEVEL SECURITY (RLS)
-- ===============================================

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 10. POLÍTICAS RLS BÁSICAS
-- ===============================================

-- Permitir INSERT: Solo usuarios autenticados pueden crear su propio club
CREATE POLICY "clubs_insert_own_profile" ON clubs
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT: Usuarios pueden ver su propio club + clubes públicos verificados
CREATE POLICY "clubs_select_own_or_public" ON clubs
    FOR SELECT 
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        (visibility = 'public' AND is_active = true AND onboarding_complete = true)
    );

-- Permitir SELECT público: Visitantes pueden ver clubes públicos verificados
CREATE POLICY "clubs_select_public_verified" ON clubs
    FOR SELECT 
    TO anon
    USING (
        visibility = 'public' AND 
        is_active = true AND 
        onboarding_complete = true AND 
        verification_status = 'verified'
    );

-- Permitir UPDATE: Solo usuarios pueden actualizar su propio club
CREATE POLICY "clubs_update_own_profile" ON clubs
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE: Solo usuarios pueden eliminar su propio club
CREATE POLICY "clubs_delete_own_profile" ON clubs
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- ===============================================
-- 11. FUNCIONES DE UTILIDAD
-- ===============================================

-- Función para buscar clubes por servicios
-- Primero eliminar si existe con firma diferente
DROP FUNCTION IF EXISTS find_clubs_by_services(TEXT[], TEXT, INTEGER);

CREATE OR REPLACE FUNCTION find_clubs_by_services(
    services_filter TEXT[],
    location_filter TEXT DEFAULT NULL,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    business_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    number_of_courts INTEGER,
    main_services JSONB,
    additional_facilities JSONB,
    avatar_url TEXT,
    has_reservation_system BOOLEAN,
    service_match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.business_name,
        c.address,
        c.phone,
        c.number_of_courts,
        c.main_services,
        c.additional_facilities,
        c.avatar_url,
        c.has_reservation_system,
        -- Puntuación basada en coincidencias de servicios
        (
            SELECT COUNT(*)::INTEGER 
            FROM unnest(services_filter) AS filter_service
            WHERE c.main_services ? filter_service
        ) as service_match_score
    FROM clubs c
    WHERE 
        c.is_active = true AND
        c.visibility = 'public' AND
        c.onboarding_complete = true AND
        c.verification_status = 'verified' AND
        (location_filter IS NULL OR c.address ILIKE '%' || location_filter || '%') AND
        c.main_services ?| services_filter
    ORDER BY service_match_score DESC, c.last_active DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener clubes cerca de una ubicación
-- Primero eliminar si existe con firma diferente
DROP FUNCTION IF EXISTS find_clubs_near_location(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION find_clubs_near_location(
    search_location TEXT,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    business_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    number_of_courts INTEGER,
    main_services JSONB,
    avatar_url TEXT,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.business_name,
        c.address,
        c.phone,
        c.number_of_courts,
        c.main_services,
        c.avatar_url,
        similarity(c.address, search_location) as similarity_score
    FROM clubs c
    WHERE 
        c.is_active = true AND
        c.visibility = 'public' AND
        c.onboarding_complete = true AND
        c.verification_status = 'verified' AND
        similarity(c.address, search_location) > 0.1
    ORDER BY similarity_score DESC, c.last_active DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de clubes
-- Primero eliminar si existe con firma diferente
DROP FUNCTION IF EXISTS get_clubs_stats();

CREATE OR REPLACE FUNCTION get_clubs_stats()
RETURNS TABLE(
    total_clubs BIGINT,
    verified_clubs BIGINT,
    avg_courts_per_club NUMERIC,
    most_common_services JSONB,
    most_common_facilities JSONB,
    clubs_with_reservation_system BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_clubs,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_clubs,
        ROUND(AVG(number_of_courts), 1) as avg_courts_per_club,
        
        -- Servicios más comunes
        (SELECT jsonb_object_agg(service, count)
         FROM (
             SELECT service, COUNT(*) as count
             FROM clubs c, jsonb_array_elements_text(c.main_services) as service
             WHERE c.is_active = true
             GROUP BY service
             ORDER BY count DESC
             LIMIT 10
         ) t1) as most_common_services,
         
        -- Instalaciones más comunes
        (SELECT jsonb_object_agg(facility, count)
         FROM (
             SELECT facility, COUNT(*) as count
             FROM clubs c, jsonb_array_elements_text(c.additional_facilities) as facility
             WHERE c.is_active = true
             GROUP BY facility
             ORDER BY count DESC
             LIMIT 10
         ) t2) as most_common_facilities,
         
        COUNT(*) FILTER (WHERE has_reservation_system = true)::BIGINT as clubs_with_reservation_system
        
    FROM clubs 
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 12. VISTAS ÚTILES
-- ===============================================

-- Vista de clubes públicos con información resumida
CREATE OR REPLACE VIEW public_clubs_summary AS
SELECT 
    id,
    business_name,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    number_of_courts,
    languages,
    main_services,
    additional_facilities,
    has_reservation_system,
    avatar_url,
    created_at
FROM clubs
WHERE 
    is_active = true AND 
    visibility = 'public' AND 
    onboarding_complete = true;

-- Vista de clubes verificados con información de contacto de reservas
CREATE OR REPLACE VIEW verified_clubs_reservations AS
SELECT 
    c.id,
    c.business_name,
    c.address,
    c.phone,
    c.has_reservation_system,
    c.reservation_systems,
    CASE 
        WHEN c.reservation_systems ? 'telefono' THEN c.reservation_phone
        ELSE c.phone
    END as contact_phone,
    c.reservation_whatsapp,
    c.reservation_web,
    c.reservation_app,
    c.main_services,
    c.avatar_url
FROM clubs c
WHERE 
    c.is_active = true AND 
    c.visibility = 'public' AND 
    c.onboarding_complete = true AND 
    c.verification_status = 'verified';

-- ===============================================
-- 13. VERIFICACIÓN FINAL
-- ===============================================

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla clubs creada correctamente' AS status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'clubs' 
    AND table_schema = 'public'
);

-- Mostrar información de la tabla
SELECT 
    'Tabla: ' || table_name as info,
    'Columnas: ' || COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'clubs' 
AND table_schema = 'public'
GROUP BY table_name;

-- Verificar índices creados
SELECT 
    'Índices creados: ' || COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename = 'clubs';

-- ===============================================
-- SIGUIENTE PASO:
-- ===============================================
-- 1. Crear tabla tiendas (03_tabla_tiendas.sql)
-- 2. Crear tabla academias (04_tabla_academias.sql)
-- 3. Crear tabla instalaciones (05_tabla_instalaciones.sql)
-- =============================================== 