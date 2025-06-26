-- ===============================================
-- SCRIPT 05: FUNCIONES Y VISTAS ÚTILES
-- ===============================================
-- Este script crea funciones y vistas que facilitan el trabajo
-- con los datos de Padelnity, incluyendo búsquedas y estadísticas
-- 
-- EJECUTAR DESPUÉS DE: 04_storage_policies.sql
-- ===============================================

-- ===============================================
-- 1. VISTAS ESPECÍFICAS POR TIPO DE NEGOCIO
-- ===============================================

-- Vista para clubes de padel
CREATE OR REPLACE VIEW club_profiles AS
SELECT 
    id,
    user_id,
    business_name,
    contact_name,
    description,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    languages,
    main_services,
    additional_facilities,
    has_reservation_system,
    reservation_systems,
    reservation_details,
    number_of_courts,
    court_types,
    avatar_url,
    banner_url,
    verification_status,
    created_at,
    updated_at
FROM businesses 
WHERE business_type = 'club';

-- Vista para tiendas
CREATE OR REPLACE VIEW tienda_profiles AS
SELECT 
    id,
    user_id,
    business_name,
    contact_name,
    description,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    years_experience,
    languages,
    main_services,
    additional_facilities,
    product_categories,
    services_offered,
    brands_available,
    avatar_url,
    banner_url,
    verification_status,
    created_at,
    updated_at
FROM businesses 
WHERE business_type = 'tienda';

-- Vista para academias
CREATE OR REPLACE VIEW academia_profiles AS
SELECT 
    id,
    user_id,
    business_name,
    contact_name,
    description,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    years_experience,
    languages,
    main_services,
    additional_facilities,
    teaching_levels,
    class_types,
    instructor_certifications,
    avatar_url,
    banner_url,
    verification_status,
    created_at,
    updated_at
FROM businesses 
WHERE business_type = 'academia';

-- Vista para instalaciones deportivas
CREATE OR REPLACE VIEW instalacion_profiles AS
SELECT 
    id,
    user_id,
    business_name,
    contact_name,
    description,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    years_experience,
    languages,
    main_services,
    additional_facilities,
    number_of_padel_courts,
    padel_court_types,
    padel_services,
    other_sports,
    avatar_url,
    banner_url,
    verification_status,
    created_at,
    updated_at
FROM businesses 
WHERE business_type = 'instalacion';

-- ===============================================
-- 2. FUNCIONES DE ESTADÍSTICAS
-- ===============================================

-- Función para obtener estadísticas de negocios
CREATE OR REPLACE FUNCTION get_business_stats()
RETURNS TABLE(
    business_type TEXT,
    total_count BIGINT,
    verified_count BIGINT,
    pending_count BIGINT,
    completed_onboarding BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.business_type::TEXT,
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_count,
        COUNT(*) FILTER (WHERE verification_status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE onboarding_complete = true)::BIGINT as completed_onboarding
    FROM businesses b
    GROUP BY b.business_type
    ORDER BY b.business_type;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de jugadores
CREATE OR REPLACE FUNCTION get_player_stats()
RETURNS TABLE(
    nivel TEXT,
    total_count BIGINT,
    completed_onboarding BIGINT,
    avg_age NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.nivel::TEXT,
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE onboarding_complete = true)::BIGINT as completed_onboarding,
        ROUND(AVG(EXTRACT(YEAR FROM AGE(fecha_nacimiento))), 1) as avg_age
    FROM players p
    WHERE fecha_nacimiento IS NOT NULL
    GROUP BY p.nivel
    ORDER BY 
        CASE p.nivel 
            WHEN 'principiante' THEN 1
            WHEN 'intermedio' THEN 2
            WHEN 'avanzado' THEN 3
            WHEN 'profesional' THEN 4
        END;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 3. FUNCIONES DE BÚSQUEDA
-- ===============================================

-- Función para buscar negocios por ubicación y servicios
CREATE OR REPLACE FUNCTION search_businesses(
    search_location TEXT DEFAULT '',
    search_services TEXT[] DEFAULT ARRAY[]::TEXT[],
    business_types TEXT[] DEFAULT ARRAY['club', 'tienda', 'academia', 'instalacion']
)
RETURNS TABLE(
    id UUID,
    business_type VARCHAR(20),
    business_name VARCHAR(100),
    address VARCHAR(200),
    phone VARCHAR(20),
    main_services JSONB,
    avatar_url TEXT,
    verification_status VARCHAR(20),
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.business_type,
        b.business_name,
        b.address,
        b.phone,
        b.main_services,
        b.avatar_url,
        b.verification_status,
        -- Puntuación de coincidencia
        (
            CASE WHEN search_location = '' THEN 0 
                 ELSE ts_rank(to_tsvector('spanish', b.address), plainto_tsquery('spanish', search_location)) * 100
            END +
            CASE WHEN array_length(search_services, 1) IS NULL THEN 0
                 ELSE (
                     SELECT COUNT(*)::INTEGER * 10
                     FROM jsonb_array_elements_text(b.main_services) AS service
                     WHERE service = ANY(search_services)
                 )
            END
        )::INTEGER as match_score
    FROM businesses b
    WHERE 
        b.business_type = ANY(business_types) AND
        b.verification_status = 'verified' AND
        (search_location = '' OR b.address ILIKE '%' || search_location || '%') AND
        (array_length(search_services, 1) IS NULL OR b.main_services ?| search_services)
    ORDER BY match_score DESC, b.business_name;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar jugadores por nivel y ubicación
CREATE OR REPLACE FUNCTION search_players(
    search_nivel VARCHAR(20) DEFAULT '',
    search_location TEXT DEFAULT '',
    search_experiencia VARCHAR(50) DEFAULT ''
)
RETURNS TABLE(
    id UUID,
    full_name VARCHAR(100),
    nivel VARCHAR(20),
    experiencia VARCHAR(50),
    ubicacion VARCHAR(100),
    posicion_favorita VARCHAR(20),
    avatar_url TEXT,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.nivel,
        p.experiencia,
        p.ubicacion,
        p.posicion_favorita,
        p.avatar_url,
        -- Puntuación de coincidencia
        (
            CASE WHEN search_nivel = '' OR p.nivel = search_nivel THEN 20 ELSE 0 END +
            CASE WHEN search_location = '' THEN 0 
                 ELSE ts_rank(to_tsvector('spanish', COALESCE(p.ubicacion, '')), plainto_tsquery('spanish', search_location)) * 100
            END +
            CASE WHEN search_experiencia = '' OR p.experiencia = search_experiencia THEN 10 ELSE 0 END
        )::INTEGER as match_score
    FROM players p
    WHERE 
        p.onboarding_complete = true AND
        (search_nivel = '' OR p.nivel = search_nivel) AND
        (search_location = '' OR p.ubicacion ILIKE '%' || search_location || '%') AND
        (search_experiencia = '' OR p.experiencia = search_experiencia)
    ORDER BY match_score DESC, p.full_name;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 4. FUNCIONES DE UTILIDAD
-- ===============================================

-- Función para obtener perfil completo de usuario (jugador o negocio)
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE(
    profile_type TEXT,
    profile_data JSONB
) AS $$
BEGIN
    -- Verificar si es jugador
    IF EXISTS (SELECT 1 FROM players WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'player'::TEXT as profile_type,
            to_jsonb(p.*) as profile_data
        FROM players p
        WHERE p.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- Verificar si es negocio
    IF EXISTS (SELECT 1 FROM businesses WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'business'::TEXT as profile_type,
            to_jsonb(b.*) as profile_data
        FROM businesses b
        WHERE b.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- No se encontró perfil
    RETURN QUERY
    SELECT 
        'none'::TEXT as profile_type,
        '{}'::JSONB as profile_data;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de uso por día
CREATE OR REPLACE FUNCTION get_daily_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    new_players BIGINT,
    new_businesses BIGINT,
    completed_onboardings BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, days_back - 1))::DATE as date
    ),
    player_stats AS (
        SELECT 
            created_at::DATE as date,
            COUNT(*) as new_players,
            COUNT(*) FILTER (WHERE onboarding_complete = true) as completed_player_onboardings
        FROM players
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY created_at::DATE
    ),
    business_stats AS (
        SELECT 
            created_at::DATE as date,
            COUNT(*) as new_businesses,
            COUNT(*) FILTER (WHERE onboarding_complete = true) as completed_business_onboardings
        FROM businesses
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY created_at::DATE
    )
    SELECT 
        ds.date,
        COALESCE(ps.new_players, 0)::BIGINT as new_players,
        COALESCE(bs.new_businesses, 0)::BIGINT as new_businesses,
        COALESCE(ps.completed_player_onboardings, 0)::BIGINT + 
        COALESCE(bs.completed_business_onboardings, 0)::BIGINT as completed_onboardings
    FROM date_series ds
    LEFT JOIN player_stats ps ON ds.date = ps.date
    LEFT JOIN business_stats bs ON ds.date = bs.date
    ORDER BY ds.date DESC;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 5. COMENTARIOS EN LAS VISTAS
-- ===============================================

COMMENT ON VIEW club_profiles IS 'Vista específica para perfiles de clubes de padel';
COMMENT ON VIEW tienda_profiles IS 'Vista específica para perfiles de tiendas de material';
COMMENT ON VIEW academia_profiles IS 'Vista específica para perfiles de academias/escuelas';
COMMENT ON VIEW instalacion_profiles IS 'Vista específica para perfiles de instalaciones deportivas';

COMMENT ON FUNCTION get_business_stats() IS 'Obtiene estadísticas generales de negocios por tipo';
COMMENT ON FUNCTION get_player_stats() IS 'Obtiene estadísticas generales de jugadores por nivel';
COMMENT ON FUNCTION search_businesses(TEXT, TEXT[], TEXT[]) IS 'Busca negocios por ubicación y servicios con puntuación de relevancia';
COMMENT ON FUNCTION search_players(VARCHAR, TEXT, VARCHAR) IS 'Busca jugadores por criterios con puntuación de relevancia';
COMMENT ON FUNCTION get_user_profile(UUID) IS 'Obtiene el perfil completo (jugador o negocio) de un usuario';
COMMENT ON FUNCTION get_daily_stats(INTEGER) IS 'Obtiene estadísticas diarias de nuevos registros y onboardings completados';

-- ===============================================
-- CONFIRMACIÓN
-- ===============================================

SELECT 'Funciones y vistas creadas correctamente' AS status
WHERE EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name IN ('club_profiles', 'tienda_profiles', 'academia_profiles', 'instalacion_profiles')
    HAVING COUNT(*) = 4
) AND EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name IN ('get_business_stats', 'get_player_stats', 'search_businesses', 'search_players')
    HAVING COUNT(*) = 4
);

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 06_verification.sql
-- =============================================== 