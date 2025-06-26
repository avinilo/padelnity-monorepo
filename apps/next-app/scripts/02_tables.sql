-- ===============================================
-- SCRIPT 02: CREACIÓN DE TABLAS PADELNITY
-- ===============================================
-- Este script crea todas las tablas necesarias para Padelnity:
-- - Tabla players: Perfiles de jugadores
-- - Tabla businesses: Perfiles de negocios (4 tipos específicos)
-- 
-- EJECUTAR DESPUÉS DE: 01_initial_setup.sql
-- ===============================================

-- ===============================================
-- 1. HACER BACKUP DE DATOS EXISTENTES (SI EXISTEN)
-- ===============================================

DO $$
BEGIN
    -- Verificar si las tablas existen y hacer backup si tienen datos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'players') THEN
        IF EXISTS (SELECT 1 FROM players LIMIT 1) THEN
            CREATE TABLE IF NOT EXISTS players_backup AS SELECT * FROM players;
            RAISE NOTICE 'Backup creado en players_backup';
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
        IF EXISTS (SELECT 1 FROM businesses LIMIT 1) THEN
            CREATE TABLE IF NOT EXISTS businesses_backup AS SELECT * FROM businesses;
            RAISE NOTICE 'Backup creado en businesses_backup';
        END IF;
    END IF;
END $$;

-- ===============================================
-- 2. ELIMINAR TABLAS EXISTENTES (CUIDADO EN PRODUCCIÓN)
-- ===============================================

DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;

-- ===============================================
-- 3. TABLA PLAYERS
-- ===============================================

CREATE TABLE public.players (
    -- ===============================================
    -- IDENTIFICACIÓN Y CONTROL
    -- ===============================================
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ===============================================
    -- INFORMACIÓN PERSONAL
    -- ===============================================
    full_name VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100),
    telefono VARCHAR(20),
    biografia TEXT,
    fecha_nacimiento DATE,
    
    -- ===============================================
    -- PERFIL DE JUGADOR
    -- ===============================================
    mano_dominante VARCHAR(10) CHECK (mano_dominante IN ('derecha', 'izquierda', 'ambidiestro')),
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('principiante', 'intermedio', 'avanzado', 'profesional')),
    experiencia VARCHAR(50) NOT NULL CHECK (experiencia IN ('< 1 año', '1-3 años', '3-5 años', '5+ años')),
    posicion_favorita VARCHAR(20) NOT NULL CHECK (posicion_favorita IN ('drive', 'reves', 'cualquiera')),
    estilo_juego VARCHAR(20) CHECK (estilo_juego IN ('agresivo', 'defensivo', 'equilibrado', 'tactico')),
    frecuencia_juego VARCHAR(20) CHECK (frecuencia_juego IN ('diario', 'semanal', 'quincenal', 'mensual', 'esporadico')),
    clubs_habituales TEXT,
    
    -- ===============================================
    -- ARRAYS Y CONFIGURACIONES (JSONB)
    -- ===============================================
    objetivos JSONB DEFAULT '[]'::jsonb,
    disponibilidad JSONB DEFAULT '[]'::jsonb,
    idiomas JSONB DEFAULT '[]'::jsonb,
    tipos_compañero JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- IMÁGENES
    -- ===============================================
    avatar_url TEXT,
    banner_url TEXT,
    
    -- ===============================================
    -- CONTROL Y TIMESTAMPS
    -- ===============================================
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ===============================================
    -- RESTRICCIONES
    -- ===============================================
    CONSTRAINT unique_user_player UNIQUE(user_id)
);

-- ===============================================
-- 4. TABLA BUSINESSES
-- ===============================================

CREATE TABLE public.businesses (
    -- ===============================================
    -- IDENTIFICACIÓN Y CONTROL
    -- ===============================================
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ===============================================
    -- INFORMACIÓN BÁSICA (COMÚN A TODOS)
    -- ===============================================
    business_type VARCHAR(20) NOT NULL CHECK (business_type IN ('club', 'tienda', 'academia', 'instalacion')),
    business_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    website VARCHAR(255),
    
    -- ===============================================
    -- HORARIOS Y OPERACIÓN
    -- ===============================================
    horario_apertura VARCHAR(10) NOT NULL CHECK (horario_apertura ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    horario_cierre VARCHAR(10) NOT NULL CHECK (horario_cierre ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'),
    years_experience VARCHAR(20) CHECK (years_experience IN ('0-1', '1-3', '3-5', '5-10', '10-15', '15+')),
    
    -- ===============================================
    -- ARRAYS Y CONFIGURACIONES (JSONB)
    -- ===============================================
    languages JSONB DEFAULT '[]'::jsonb,
    main_services JSONB DEFAULT '[]'::jsonb,
    additional_facilities JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- ESPECÍFICO PARA CLUBES DE PADEL
    -- ===============================================
    has_reservation_system BOOLEAN DEFAULT FALSE,
    reservation_systems JSONB DEFAULT '[]'::jsonb,
    reservation_details JSONB DEFAULT '{}'::jsonb,
    number_of_courts INTEGER,
    court_types JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- ESPECÍFICO PARA TIENDAS
    -- ===============================================
    product_categories JSONB DEFAULT '[]'::jsonb,
    services_offered JSONB DEFAULT '[]'::jsonb,
    brands_available JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- ESPECÍFICO PARA ACADEMIAS
    -- ===============================================
    teaching_levels JSONB DEFAULT '[]'::jsonb,
    class_types JSONB DEFAULT '[]'::jsonb,
    instructor_certifications JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- ESPECÍFICO PARA INSTALACIONES DEPORTIVAS
    -- ===============================================
    number_of_padel_courts INTEGER,
    padel_court_types JSONB DEFAULT '[]'::jsonb,
    padel_services JSONB DEFAULT '[]'::jsonb,
    other_sports JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- IMÁGENES Y MULTIMEDIA
    -- ===============================================
    avatar_url TEXT,
    banner_url TEXT,
    
    -- ===============================================
    -- CONTROL Y TIMESTAMPS
    -- ===============================================
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ===============================================
    -- RESTRICCIONES Y VALIDACIONES
    -- ===============================================
    CONSTRAINT unique_user_business UNIQUE(user_id),
    CONSTRAINT instalacion_must_have_padel CHECK (
        business_type != 'instalacion' OR 
        (number_of_padel_courts >= 1 AND jsonb_array_length(padel_services) > 0)
    )
);

-- ===============================================
-- 5. ÍNDICES DE OPTIMIZACIÓN
-- ===============================================

-- Índices para PLAYERS
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_nivel ON players(nivel);
CREATE INDEX IF NOT EXISTS idx_players_ubicacion ON players USING gin(to_tsvector('spanish', ubicacion));
CREATE INDEX IF NOT EXISTS idx_players_onboarding ON players(onboarding_complete);
CREATE INDEX IF NOT EXISTS idx_players_fecha_nacimiento ON players(fecha_nacimiento);
CREATE INDEX IF NOT EXISTS idx_players_experiencia ON players(experiencia);
CREATE INDEX IF NOT EXISTS idx_players_posicion ON players(posicion_favorita);

-- Índices para BUSINESSES
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_businesses_address ON businesses USING gin(to_tsvector('spanish', address));
CREATE INDEX IF NOT EXISTS idx_businesses_verification ON businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_onboarding ON businesses(onboarding_complete);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses USING gin(to_tsvector('spanish', business_name));

-- Índices específicos para búsquedas por servicios
CREATE INDEX IF NOT EXISTS idx_businesses_main_services ON businesses USING gin(main_services);
CREATE INDEX IF NOT EXISTS idx_businesses_languages ON businesses USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_businesses_facilities ON businesses USING gin(additional_facilities);

-- Índices específicos por tipo de negocio
CREATE INDEX IF NOT EXISTS idx_businesses_courts ON businesses(number_of_courts) WHERE business_type = 'club';
CREATE INDEX IF NOT EXISTS idx_businesses_padel_courts ON businesses(number_of_padel_courts) WHERE business_type = 'instalacion';
CREATE INDEX IF NOT EXISTS idx_businesses_product_categories ON businesses USING gin(product_categories) WHERE business_type = 'tienda';

-- ===============================================
-- 6. TRIGGERS PARA TIMESTAMPS
-- ===============================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers para ambas tablas
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- CONFIRMACIÓN
-- ===============================================

SELECT 'Tablas creadas correctamente' AS status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name IN ('players', 'businesses') 
  AND table_schema = 'public'
  HAVING COUNT(*) = 2
);

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 03_rls_policies.sql
-- =============================================== 