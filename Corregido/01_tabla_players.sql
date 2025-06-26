-- ===============================================
-- TABLA PLAYERS - JUGADORES DE PADEL
-- ===============================================
-- Esta tabla almacena todos los perfiles de jugadores de Padelnity
-- Incluye todos los campos del formulario de onboarding de jugadores
-- 
-- EJECUTAR EN EL SIGUIENTE ORDEN:
-- 1. Extensiones y configuración inicial
-- 2. Este script para crear la tabla players
-- 3. Políticas RLS para players
-- 4. Storage policies
-- ===============================================

-- ===============================================
-- 1. EXTENSIONES NECESARIAS (SI NO ESTÁN)
-- ===============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 2. STORAGE BUCKETS PARA IMÁGENES (SI NO ESTÁN)
-- ===============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 3. BACKUP DE DATOS EXISTENTES (SI EXISTEN)
-- ===============================================

DO $$
BEGIN
    -- Verificar si la tabla existe y tiene datos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'players') THEN
        IF EXISTS (SELECT 1 FROM players LIMIT 1) THEN
            CREATE TABLE IF NOT EXISTS players_backup AS SELECT * FROM players;
            RAISE NOTICE 'Backup creado en players_backup';
        END IF;
    END IF;
END $$;

-- ===============================================
-- 4. ELIMINAR TABLA EXISTENTE SI EXISTE
-- ===============================================

DROP TABLE IF EXISTS public.players CASCADE;

-- ===============================================
-- 5. CREAR TABLA PLAYERS COMPLETA
-- ===============================================

CREATE TABLE public.players (
    -- ===============================================
    -- IDENTIFICACIÓN Y CONTROL
    -- ===============================================
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ===============================================
    -- INFORMACIÓN PERSONAL BÁSICA
    -- ===============================================
    full_name VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100),                    -- "Ciudad, país"
    telefono VARCHAR(20),                      -- "+34 000 000 000"
    biografia TEXT,                            -- Descripción libre del jugador
    fecha_nacimiento DATE,                     -- Fecha de nacimiento del jugador
    
    -- ===============================================
    -- PERFIL DE JUGADOR - CARACTERÍSTICAS FÍSICAS
    -- ===============================================
    mano_dominante VARCHAR(10) CHECK (mano_dominante IN ('diestro', 'zurdo')),
    
    -- ===============================================
    -- PERFIL DE JUGADOR - NIVEL Y EXPERIENCIA
    -- ===============================================
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('principiante', 'intermedio', 'avanzado', 'profesional')),
    experiencia VARCHAR(20) NOT NULL CHECK (experiencia IN ('< 1 año', '1-3 años', '3-5 años', '5+ años')),
    posicion_favorita VARCHAR(20) NOT NULL CHECK (posicion_favorita IN ('drive', 'reves', 'cualquiera')),
    
    -- ===============================================
    -- PERFIL DE JUGADOR - ESTILO Y FRECUENCIA
    -- ===============================================
    estilo_juego VARCHAR(20) CHECK (estilo_juego IN ('agresivo', 'defensivo', 'equilibrado', 'tecnico')),
    frecuencia_juego VARCHAR(30) CHECK (frecuencia_juego IN ('1-vez-semana', '2-veces-semana', '3-4-veces-semana', 'diario', 'ocasional')),
    
    -- ===============================================
    -- INFORMACIÓN ADICIONAL DE JUEGO
    -- ===============================================
    clubs_habituales TEXT,                     -- "Club Deportivo XYZ, Padel Center ABC..."
    
    -- ===============================================
    -- ARRAYS DE PREFERENCIAS Y OBJETIVOS (JSONB)
    -- ===============================================
    -- Objetivos del jugador: ["mejorar-tecnica", "competir-torneos", "socializar", "ejercicio", "diversion", "profesional"]
    objetivos JSONB DEFAULT '[]'::jsonb,
    
    -- Disponibilidad horaria: ["mañanas", "tardes", "noches", "fines-semana", "flexible"]
    disponibilidad JSONB DEFAULT '[]'::jsonb,
    
    -- Idiomas que habla: ["español", "inglés", "francés", "alemán", "italiano", "portugués"]
    idiomas JSONB DEFAULT '[]'::jsonb,
    
    -- Tipo de compañero preferido: ["mismo-nivel", "mejor-nivel", "menor-nivel", "competitivo", "recreativo", "cualquiera"]
    tipos_compañero JSONB DEFAULT '[]'::jsonb,
    
    -- ===============================================
    -- IMÁGENES DEL PERFIL
    -- ===============================================
    avatar_url TEXT,                           -- URL de la foto de perfil
    banner_url TEXT,                           -- URL de la imagen de portada
    
    -- ===============================================
    -- CONTROL Y ESTADO
    -- ===============================================
    onboarding_complete BOOLEAN DEFAULT FALSE,  -- Si completó el proceso de registro
    is_active BOOLEAN DEFAULT TRUE,             -- Si el perfil está activo
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'friends')),
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
    CONSTRAINT unique_user_player UNIQUE(user_id),
    CONSTRAINT valid_full_name CHECK (length(trim(full_name)) >= 2),
    CONSTRAINT valid_phone_format CHECK (telefono IS NULL OR telefono ~ '^\+?[0-9\s\-\(\)]{7,}$'),
    CONSTRAINT valid_objetivos_array CHECK (jsonb_typeof(objetivos) = 'array'),
    CONSTRAINT valid_disponibilidad_array CHECK (jsonb_typeof(disponibilidad) = 'array'),
    CONSTRAINT valid_idiomas_array CHECK (jsonb_typeof(idiomas) = 'array'),
    CONSTRAINT valid_tipos_compañero_array CHECK (jsonb_typeof(tipos_compañero) = 'array')
);

-- ===============================================
-- 6. COMENTARIOS EXPLICATIVOS
-- ===============================================

COMMENT ON TABLE players IS 'Perfiles de jugadores de padel registrados en Padelnity';
COMMENT ON COLUMN players.full_name IS 'Nombre completo del jugador (obligatorio)';
COMMENT ON COLUMN players.nivel IS 'Nivel de juego: principiante, intermedio, avanzado, profesional';
COMMENT ON COLUMN players.experiencia IS 'Tiempo jugando al padel';
COMMENT ON COLUMN players.posicion_favorita IS 'Posición preferida en la pista: drive, reves, cualquiera';
COMMENT ON COLUMN players.objetivos IS 'Array JSON con objetivos del jugador';
COMMENT ON COLUMN players.disponibilidad IS 'Array JSON con horarios disponibles';
COMMENT ON COLUMN players.idiomas IS 'Array JSON con idiomas que habla';
COMMENT ON COLUMN players.tipos_compañero IS 'Array JSON con tipos de compañero preferidos';
COMMENT ON COLUMN players.verification_status IS 'Estado de verificación: pending, verified, rejected';

-- ===============================================
-- 7. ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_nivel ON players(nivel);
CREATE INDEX IF NOT EXISTS idx_players_experiencia ON players(experiencia);
CREATE INDEX IF NOT EXISTS idx_players_posicion_favorita ON players(posicion_favorita);
CREATE INDEX IF NOT EXISTS idx_players_onboarding ON players(onboarding_complete);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON players(is_active);
CREATE INDEX IF NOT EXISTS idx_players_visibility ON players(visibility);
CREATE INDEX IF NOT EXISTS idx_players_verification_status ON players(verification_status);

-- Índices para búsquedas geográficas
CREATE INDEX IF NOT EXISTS idx_players_ubicacion ON players USING gin(to_tsvector('spanish', ubicacion));

-- Índices para búsquedas por arrays JSONB
CREATE INDEX IF NOT EXISTS idx_players_objetivos ON players USING gin(objetivos);
CREATE INDEX IF NOT EXISTS idx_players_disponibilidad ON players USING gin(disponibilidad);
CREATE INDEX IF NOT EXISTS idx_players_idiomas ON players USING gin(idiomas);
CREATE INDEX IF NOT EXISTS idx_players_tipos_compañero ON players USING gin(tipos_compañero);

-- Índices compuestos para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_players_active_nivel ON players(is_active, nivel) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_players_active_ubicacion ON players(is_active, ubicacion) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_players_verified_active ON players(verification_status, is_active) WHERE visibility = 'public';

-- Índices de timestamp
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);
CREATE INDEX IF NOT EXISTS idx_players_last_active ON players(last_active);

-- ===============================================
-- 8. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ===============================================

CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- También actualizar last_active si cambió información relevante
    IF OLD.onboarding_complete != NEW.onboarding_complete OR 
       OLD.is_active != NEW.is_active THEN
        NEW.last_active = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 9. TRIGGER PARA TIMESTAMPS AUTOMÁTICOS
-- ===============================================

DROP TRIGGER IF EXISTS update_players_updated_at_trigger ON players;
CREATE TRIGGER update_players_updated_at_trigger
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_players_updated_at();

-- ===============================================
-- 10. HABILITAR ROW LEVEL SECURITY (RLS)
-- ===============================================

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 11. POLÍTICAS RLS BÁSICAS
-- ===============================================

-- Permitir INSERT: Solo usuarios autenticados pueden crear su propio perfil
CREATE POLICY "players_insert_own_profile" ON players
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT: Usuarios pueden ver su propio perfil + perfiles públicos de otros
CREATE POLICY "players_select_own_or_public" ON players
    FOR SELECT 
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        (visibility = 'public' AND is_active = true AND onboarding_complete = true)
    );

-- Permitir UPDATE: Solo usuarios pueden actualizar su propio perfil
CREATE POLICY "players_update_own_profile" ON players
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE: Solo usuarios pueden eliminar su propio perfil
CREATE POLICY "players_delete_own_profile" ON players
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- ===============================================
-- 12. FUNCIONES DE UTILIDAD
-- ===============================================

-- Función para buscar jugadores compatibles
-- Primero eliminar si existe con firma diferente
DROP FUNCTION IF EXISTS find_compatible_players(UUID, BOOLEAN, INTEGER);

CREATE OR REPLACE FUNCTION find_compatible_players(
    player_user_id UUID,
    same_level_only BOOLEAN DEFAULT FALSE,
    max_distance_km INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    full_name VARCHAR(100),
    nivel VARCHAR(20),
    ubicacion VARCHAR(100),
    objetivos JSONB,
    idiomas JSONB,
    avatar_url TEXT,
    verification_status VARCHAR(20),
    compatibility_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.nivel,
        p.ubicacion,
        p.objetivos,
        p.idiomas,
        p.avatar_url,
        p.verification_status,
        -- Puntuación de compatibilidad mejorada (incluye bonus por verificación)
        (
            CASE WHEN current_player.nivel = p.nivel THEN 3 ELSE 0 END +
            CASE WHEN current_player.objetivos ?| array(SELECT jsonb_array_elements_text(p.objetivos)) THEN 2 ELSE 0 END +
            CASE WHEN current_player.idiomas ?| array(SELECT jsonb_array_elements_text(p.idiomas)) THEN 1 ELSE 0 END +
            CASE WHEN p.verification_status = 'verified' THEN 1 ELSE 0 END  -- Bonus por verificación
        ) as compatibility_score
    FROM players p
    CROSS JOIN (
        SELECT nivel, objetivos, idiomas 
        FROM players 
        WHERE user_id = player_user_id
    ) as current_player
    WHERE 
        p.user_id != player_user_id AND
        p.is_active = true AND
        p.visibility = 'public' AND
        p.onboarding_complete = true AND
        (NOT same_level_only OR p.nivel = current_player.nivel)
    ORDER BY 
        compatibility_score DESC, 
        CASE WHEN p.verification_status = 'verified' THEN 0 ELSE 1 END,  -- Verificados primero
        p.last_active DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del jugador
-- Primero eliminar si existe con firma diferente
DROP FUNCTION IF EXISTS get_player_stats();

CREATE OR REPLACE FUNCTION get_player_stats()
RETURNS TABLE(
    total_players BIGINT,
    verified_players BIGINT,
    by_level JSONB,
    by_experience JSONB,
    by_verification_status JSONB,
    avg_age NUMERIC,
    most_common_objetivos JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_players,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_players,
        
        -- Estadísticas por nivel
        (SELECT jsonb_object_agg(nivel, count) 
         FROM (SELECT nivel, COUNT(*) as count FROM players WHERE is_active = true GROUP BY nivel) t1) as by_level,
        
        -- Estadísticas por experiencia
        (SELECT jsonb_object_agg(experiencia, count) 
         FROM (SELECT experiencia, COUNT(*) as count FROM players WHERE is_active = true GROUP BY experiencia) t2) as by_experience,
        
        -- Estadísticas por estado de verificación
        (SELECT jsonb_object_agg(verification_status, count) 
         FROM (SELECT verification_status, COUNT(*) as count FROM players WHERE is_active = true GROUP BY verification_status) t3) as by_verification_status,
        
        -- Edad promedio
        ROUND(AVG(EXTRACT(YEAR FROM AGE(fecha_nacimiento))), 1) as avg_age,
        
        -- Objetivos más comunes
        (SELECT jsonb_object_agg(objetivo, count)
         FROM (
             SELECT objetivo, COUNT(*) as count
             FROM players p, jsonb_array_elements_text(p.objetivos) as objetivo
             WHERE p.is_active = true
             GROUP BY objetivo
             ORDER BY count DESC
             LIMIT 10
         ) t4) as most_common_objetivos
        
    FROM players 
    WHERE is_active = true AND fecha_nacimiento IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar jugadores verificados (profesionales, coaches, etc.)
CREATE OR REPLACE FUNCTION find_verified_players(
    search_location TEXT DEFAULT NULL,
    search_level VARCHAR(20) DEFAULT NULL,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    full_name VARCHAR(100),
    nivel VARCHAR(20),
    experiencia VARCHAR(20),
    ubicacion VARCHAR(100),
    biografia TEXT,
    objetivos JSONB,
    avatar_url TEXT,
    verification_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.nivel,
        p.experiencia,
        p.ubicacion,
        p.biografia,
        p.objetivos,
        p.avatar_url,
        p.verification_status,
        p.created_at
    FROM players p
    WHERE 
        p.verification_status = 'verified' AND
        p.is_active = true AND
        p.visibility = 'public' AND
        p.onboarding_complete = true AND
        (search_location IS NULL OR p.ubicacion ILIKE '%' || search_location || '%') AND
        (search_level IS NULL OR p.nivel = search_level)
    ORDER BY 
        p.last_active DESC,
        p.created_at DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 13. VERIFICACIÓN FINAL
-- ===============================================

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla players creada correctamente' AS status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'players' 
    AND table_schema = 'public'
);

-- Mostrar información de la tabla
SELECT 
    'Tabla: ' || table_name as info,
    'Columnas: ' || COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'players' 
AND table_schema = 'public'
GROUP BY table_name;

-- Verificar índices creados
SELECT 
    'Índices creados: ' || COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename = 'players';

-- ===============================================
-- SIGUIENTE PASO:
-- ===============================================
-- 1. Crear tabla clubs (02_tabla_clubs.sql)
-- 2. Crear tabla tiendas (03_tabla_tiendas.sql)  
-- 3. Crear tabla academias (04_tabla_academias.sql)
-- 4. Crear tabla instalaciones (05_tabla_instalaciones.sql)
-- =============================================== 