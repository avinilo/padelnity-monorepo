-- ===============================================
-- TABLA TIENDAS - TIENDAS DE MATERIAL DE PADEL
-- ===============================================
-- Esta tabla almacena todos los perfiles de tiendas de material de padel de Padelnity
-- Incluye todos los campos del formulario de onboarding de tiendas
-- 
-- EJECUTAR DESPUÉS DE: 02_tabla_clubs.sql
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
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tiendas') THEN
        IF EXISTS (SELECT 1 FROM tiendas LIMIT 1) THEN
            CREATE TABLE IF NOT EXISTS tiendas_backup AS SELECT * FROM tiendas;
            RAISE NOTICE 'Backup creado en tiendas_backup';
        END IF;
    END IF;
END $$;

-- ===============================================
-- 3. ELIMINAR TABLA EXISTENTE SI EXISTE
-- ===============================================

DROP TABLE IF EXISTS public.tiendas CASCADE;

-- ===============================================
-- 4. CREAR TABLA TIENDAS COMPLETA
-- ===============================================

CREATE TABLE public.tiendas (
    -- ===============================================
    -- IDENTIFICACIÓN Y CONTROL
    -- ===============================================
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ===============================================
    -- INFORMACIÓN BÁSICA DEL NEGOCIO
    -- ===============================================
    business_name VARCHAR(200) NOT NULL,          -- Nombre de la tienda
    contact_name VARCHAR(100) NOT NULL,           -- Nombre de contacto
    description TEXT,                             -- Descripción de la tienda
    address TEXT NOT NULL,                        -- Dirección completa
    phone VARCHAR(20) NOT NULL,                   -- Teléfono principal
    email VARCHAR(100),                           -- Email de la tienda
    website VARCHAR(255),                         -- Página web de la tienda
    
    -- ===============================================
    -- HORARIOS DE OPERACIÓN
    -- ===============================================
    horario_apertura TIME NOT NULL,               -- Hora de apertura (formato HH:MM)
    horario_cierre TIME NOT NULL,                 -- Hora de cierre (formato HH:MM)
    
    -- ===============================================
    -- INFORMACIÓN ESPECÍFICA DE LA TIENDA
    -- ===============================================
    years_experience VARCHAR(10),                 -- Años de experiencia: "0-1", "1-3", "3-5", "5-10", "10-15", "15+"
    
    -- ===============================================
    -- ARRAYS DE CONFIGURACIÓN (JSONB)
    -- ===============================================
    -- Idiomas de atención: ["espanol", "ingles", "frances", "aleman", "italiano", "portugues"]
    languages JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Categorías de productos: ["todo", "palas", "pelotas", "ropa-deportiva", "calzado", "complementos", "mochilas-bolsas", "grips-overgrips", "protectores", "raqueteros", "muñequeras"]
    product_categories JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Servicios ofrecidos: ["venta-presencial", "venta-online", "asesoramiento", "prueba-palas", "personalizacion", "mantenimiento", "cambio-grip", "servicio-tecnico", "entrega-domicilio", "recogida-tienda"]
    services_offered JSONB DEFAULT '[]'::jsonb,
    
    -- Instalaciones adicionales: ["probador", "zona-pruebas", "aparcamiento", "aire-acondicionado", "wifi", "acceso-silla-ruedas", "tarjeta-credito", "bizum", "transferencia"]
    additional_facilities JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- IMÁGENES DE LA TIENDA
    -- ===============================================
    avatar_url TEXT,                              -- URL del logo de la tienda
    banner_url TEXT,                              -- URL de la imagen de portada de la tienda
    
    -- ===============================================
    -- CONTROL Y ESTADO
    -- ===============================================
    onboarding_complete BOOLEAN DEFAULT FALSE,    -- Si completó el proceso de registro
    is_active BOOLEAN DEFAULT TRUE,               -- Si la tienda está activa
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
    CONSTRAINT unique_user_tienda UNIQUE(user_id),
    CONSTRAINT valid_business_name CHECK (length(trim(business_name)) >= 2),
    CONSTRAINT valid_contact_name CHECK (length(trim(contact_name)) >= 2),
    CONSTRAINT valid_phone_format CHECK (phone ~ '^\+?[0-9\s\-\(\)]{7,}$'),
    CONSTRAINT valid_email_format CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_website_format CHECK (website IS NULL OR website ~ '^https?://'),
    CONSTRAINT valid_horarios CHECK (horario_apertura < horario_cierre),
    CONSTRAINT valid_years_experience CHECK (years_experience IS NULL OR years_experience IN ('0-1', '1-3', '3-5', '5-10', '10-15', '15+')),
    CONSTRAINT valid_languages_array CHECK (jsonb_typeof(languages) = 'array'),
    CONSTRAINT valid_product_categories_array CHECK (jsonb_typeof(product_categories) = 'array'),
    CONSTRAINT valid_services_offered_array CHECK (jsonb_typeof(services_offered) = 'array'),
    CONSTRAINT valid_additional_facilities_array CHECK (jsonb_typeof(additional_facilities) = 'array')
);

-- ===============================================
-- 5. COMENTARIOS EXPLICATIVOS
-- ===============================================

COMMENT ON TABLE tiendas IS 'Perfiles de tiendas de material de padel registradas en Padelnity';
COMMENT ON COLUMN tiendas.business_name IS 'Nombre comercial de la tienda de material de padel';
COMMENT ON COLUMN tiendas.contact_name IS 'Nombre de la persona de contacto';
COMMENT ON COLUMN tiendas.years_experience IS 'Años de experiencia en el sector del padel';
COMMENT ON COLUMN tiendas.languages IS 'Array JSON con idiomas de atención al cliente';
COMMENT ON COLUMN tiendas.product_categories IS 'Array JSON con categorías de productos vendidos';
COMMENT ON COLUMN tiendas.services_offered IS 'Array JSON con servicios ofrecidos por la tienda';
COMMENT ON COLUMN tiendas.additional_facilities IS 'Array JSON con instalaciones y facilidades de pago';

-- ===============================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_tiendas_user_id ON tiendas(user_id);
CREATE INDEX IF NOT EXISTS idx_tiendas_business_name ON tiendas(business_name);
CREATE INDEX IF NOT EXISTS idx_tiendas_onboarding ON tiendas(onboarding_complete);
CREATE INDEX IF NOT EXISTS idx_tiendas_is_active ON tiendas(is_active);
CREATE INDEX IF NOT EXISTS idx_tiendas_visibility ON tiendas(visibility);
CREATE INDEX IF NOT EXISTS idx_tiendas_verification_status ON tiendas(verification_status);

-- Índices para búsquedas geográficas
CREATE INDEX IF NOT EXISTS idx_tiendas_address ON tiendas USING gin(to_tsvector('spanish', address));

-- Índices para características de la tienda
CREATE INDEX IF NOT EXISTS idx_tiendas_years_experience ON tiendas(years_experience) WHERE years_experience IS NOT NULL;

-- Índices para búsquedas por arrays JSONB
CREATE INDEX IF NOT EXISTS idx_tiendas_languages ON tiendas USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_tiendas_product_categories ON tiendas USING gin(product_categories);
CREATE INDEX IF NOT EXISTS idx_tiendas_services_offered ON tiendas USING gin(services_offered);
CREATE INDEX IF NOT EXISTS idx_tiendas_additional_facilities ON tiendas USING gin(additional_facilities);

-- Índices compuestos para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_tiendas_active_verified ON tiendas(is_active, verification_status) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_tiendas_active_address ON tiendas(is_active, address) WHERE visibility = 'public';

-- Índices de timestamp
CREATE INDEX IF NOT EXISTS idx_tiendas_created_at ON tiendas(created_at);
CREATE INDEX IF NOT EXISTS idx_tiendas_last_active ON tiendas(last_active);

-- Índice para búsquedas de texto completo
CREATE INDEX IF NOT EXISTS idx_tiendas_search_text ON tiendas USING gin(
    to_tsvector('spanish', 
        coalesce(business_name, '') || ' ' || 
        coalesce(description, '') || ' ' || 
        coalesce(address, '')
    )
);

-- ===============================================
-- 7. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ===============================================

CREATE OR REPLACE FUNCTION update_tiendas_updated_at()
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

DROP TRIGGER IF EXISTS update_tiendas_updated_at_trigger ON tiendas;
CREATE TRIGGER update_tiendas_updated_at_trigger
    BEFORE UPDATE ON tiendas
    FOR EACH ROW
    EXECUTE FUNCTION update_tiendas_updated_at();

-- ===============================================
-- 9. HABILITAR ROW LEVEL SECURITY (RLS)
-- ===============================================

ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 10. POLÍTICAS RLS BÁSICAS
-- ===============================================

-- Permitir INSERT: Solo usuarios autenticados pueden crear su propia tienda
CREATE POLICY "tiendas_insert_own_profile" ON tiendas
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT: Usuarios pueden ver su propia tienda + tiendas públicas verificadas
CREATE POLICY "tiendas_select_own_or_public" ON tiendas
    FOR SELECT 
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        (visibility = 'public' AND is_active = true AND onboarding_complete = true)
    );

-- Permitir SELECT público: Visitantes pueden ver tiendas públicas verificadas
CREATE POLICY "tiendas_select_public_verified" ON tiendas
    FOR SELECT 
    TO anon
    USING (
        visibility = 'public' AND 
        is_active = true AND 
        onboarding_complete = true AND 
        verification_status = 'verified'
    );

-- Permitir UPDATE: Solo usuarios pueden actualizar su propia tienda
CREATE POLICY "tiendas_update_own_profile" ON tiendas
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE: Solo usuarios pueden eliminar su propia tienda
CREATE POLICY "tiendas_delete_own_profile" ON tiendas
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- ===============================================
-- 11. FUNCIONES DE UTILIDAD
-- ===============================================

-- Función para buscar tiendas por productos
CREATE OR REPLACE FUNCTION find_tiendas_by_products(
    products_filter TEXT[],
    location_filter TEXT DEFAULT NULL,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    business_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    product_categories JSONB,
    services_offered JSONB,
    additional_facilities JSONB,
    avatar_url TEXT,
    years_experience VARCHAR(10),
    product_match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.business_name,
        t.address,
        t.phone,
        t.product_categories,
        t.services_offered,
        t.additional_facilities,
        t.avatar_url,
        t.years_experience,
        -- Puntuación basada en coincidencias de productos
        (
            SELECT COUNT(*)::INTEGER 
            FROM unnest(products_filter) AS filter_product
            WHERE t.product_categories ? filter_product OR t.product_categories ? 'todo'
        ) as product_match_score
    FROM tiendas t
    WHERE 
        t.is_active = true AND
        t.visibility = 'public' AND
        t.onboarding_complete = true AND
        t.verification_status = 'verified' AND
        (location_filter IS NULL OR t.address ILIKE '%' || location_filter || '%') AND
        (t.product_categories ?| products_filter OR t.product_categories ? 'todo')
    ORDER BY product_match_score DESC, t.last_active DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar tiendas por servicios
CREATE OR REPLACE FUNCTION find_tiendas_by_services(
    services_filter TEXT[],
    location_filter TEXT DEFAULT NULL,
    max_results INTEGER DEFAULT 15
)
RETURNS TABLE(
    id UUID,
    business_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    services_offered JSONB,
    product_categories JSONB,
    avatar_url TEXT,
    service_match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.business_name,
        t.address,
        t.phone,
        t.services_offered,
        t.product_categories,
        t.avatar_url,
        -- Puntuación basada en coincidencias de servicios
        (
            SELECT COUNT(*)::INTEGER 
            FROM unnest(services_filter) AS filter_service
            WHERE t.services_offered ? filter_service
        ) as service_match_score
    FROM tiendas t
    WHERE 
        t.is_active = true AND
        t.visibility = 'public' AND
        t.onboarding_complete = true AND
        t.verification_status = 'verified' AND
        (location_filter IS NULL OR t.address ILIKE '%' || location_filter || '%') AND
        t.services_offered ?| services_filter
    ORDER BY service_match_score DESC, t.last_active DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tiendas cerca de una ubicación
CREATE OR REPLACE FUNCTION find_tiendas_near_location(
    search_location TEXT,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    business_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(20),
    product_categories JSONB,
    services_offered JSONB,
    avatar_url TEXT,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.business_name,
        t.address,
        t.phone,
        t.product_categories,
        t.services_offered,
        t.avatar_url,
        similarity(t.address, search_location) as similarity_score
    FROM tiendas t
    WHERE 
        t.is_active = true AND
        t.visibility = 'public' AND
        t.onboarding_complete = true AND
        t.verification_status = 'verified' AND
        similarity(t.address, search_location) > 0.1
    ORDER BY similarity_score DESC, t.last_active DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de tiendas
CREATE OR REPLACE FUNCTION get_tiendas_stats()
RETURNS TABLE(
    total_tiendas BIGINT,
    verified_tiendas BIGINT,
    most_common_products JSONB,
    most_common_services JSONB,
    tiendas_by_experience JSONB,
    avg_services_per_tienda NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_tiendas,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_tiendas,
        
        -- Productos más comunes
        (SELECT jsonb_object_agg(product, count)
         FROM (
             SELECT product, COUNT(*) as count
             FROM tiendas t, jsonb_array_elements_text(t.product_categories) as product
             WHERE t.is_active = true
             GROUP BY product
             ORDER BY count DESC
             LIMIT 10
         ) t1) as most_common_products,
         
        -- Servicios más comunes
        (SELECT jsonb_object_agg(service, count)
         FROM (
             SELECT service, COUNT(*) as count
             FROM tiendas t, jsonb_array_elements_text(t.services_offered) as service
             WHERE t.is_active = true
             GROUP BY service
             ORDER BY count DESC
             LIMIT 10
         ) t2) as most_common_services,
         
        -- Tiendas por experiencia
        (SELECT jsonb_object_agg(years_experience, count) 
         FROM (SELECT years_experience, COUNT(*) as count FROM tiendas WHERE is_active = true AND years_experience IS NOT NULL GROUP BY years_experience) t3) as tiendas_by_experience,
         
        -- Promedio de servicios por tienda
        ROUND(AVG(jsonb_array_length(services_offered)), 1) as avg_services_per_tienda
        
    FROM tiendas 
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 12. VISTAS ÚTILES
-- ===============================================

-- Vista de tiendas públicas con información resumida
CREATE OR REPLACE VIEW public_tiendas_summary AS
SELECT 
    id,
    business_name,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    years_experience,
    languages,
    product_categories,
    services_offered,
    additional_facilities,
    avatar_url,
    created_at
FROM tiendas
WHERE 
    is_active = true AND 
    visibility = 'public' AND 
    onboarding_complete = true;

-- Vista de tiendas verificadas con servicios especializados
CREATE OR REPLACE VIEW verified_tiendas_services AS
SELECT 
    t.id,
    t.business_name,
    t.address,
    t.phone,
    t.product_categories,
    t.services_offered,
    t.years_experience,
    t.avatar_url,
    -- Indicadores de servicios especializados
    CASE WHEN t.services_offered ? 'asesoramiento' THEN true ELSE false END as offers_consultation,
    CASE WHEN t.services_offered ? 'prueba-palas' THEN true ELSE false END as offers_paddle_testing,
    CASE WHEN t.services_offered ? 'personalizacion' THEN true ELSE false END as offers_customization,
    CASE WHEN t.services_offered ? 'servicio-tecnico' THEN true ELSE false END as offers_technical_service,
    CASE WHEN t.services_offered ? 'venta-online' THEN true ELSE false END as has_online_store
FROM tiendas t
WHERE 
    t.is_active = true AND 
    t.visibility = 'public' AND 
    t.onboarding_complete = true AND 
    t.verification_status = 'verified';

-- ===============================================
-- 13. VERIFICACIÓN FINAL
-- ===============================================

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla tiendas creada correctamente' AS status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tiendas' 
    AND table_schema = 'public'
);

-- Mostrar información de la tabla
SELECT 
    'Tabla: ' || table_name as info,
    'Columnas: ' || COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'tiendas' 
AND table_schema = 'public'
GROUP BY table_name;

-- Verificar índices creados
SELECT 
    'Índices creados: ' || COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename = 'tiendas';

-- ===============================================
-- SIGUIENTE PASO:
-- ===============================================
-- 1. Crear tabla academias (04_tabla_academias.sql)
-- 2. Crear tabla instalaciones (05_tabla_instalaciones.sql)
-- =============================================== 