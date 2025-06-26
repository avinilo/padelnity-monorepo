-- ===============================================
-- SCRIPT 07: FUNCIONES GLOBALES Y VISTAS
-- ===============================================
-- Este script crea funciones y vistas que facilitan el trabajo
-- con los datos de Padelnity en el nuevo esquema de 5 tablas
-- 
-- EJECUTAR DESPUÉS DE: 06_politicas_storage.sql
-- Versión: 2.0 - Esquema con 5 tablas especializadas
-- ===============================================

-- ===============================================
-- 1. FUNCIONES DE BÚSQUEDA UNIFICADA
-- ===============================================

-- Función para buscar en todas las tablas de negocios
CREATE OR REPLACE FUNCTION search_all_businesses(
    search_term TEXT DEFAULT '',
    search_location TEXT DEFAULT '',
    business_types TEXT[] DEFAULT ARRAY['clubs', 'tiendas', 'academias', 'instalaciones']
)
RETURNS TABLE(
    id UUID,
    business_type TEXT,
    business_name VARCHAR(100),
    contact_name VARCHAR(100),
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    avatar_url TEXT,
    banner_url TEXT,
    verification_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    (
        -- Buscar en clubs
        SELECT 
            c.id, 'club'::TEXT as business_type, c.business_name, c.contact_name, 
            c.description, c.address, c.phone, c.email, c.website,
            c.avatar_url, c.banner_url, c.verification_status, c.created_at
        FROM clubs c
        WHERE ('clubs' = ANY(business_types))
        AND (
            search_term = '' OR 
            c.business_name ILIKE '%' || search_term || '%' OR
            c.description ILIKE '%' || search_term || '%' OR
            c.contact_name ILIKE '%' || search_term || '%'
        )
        AND (
            search_location = '' OR 
            c.address ILIKE '%' || search_location || '%'
        )
        
        UNION ALL
        
        -- Buscar en tiendas
        SELECT 
            t.id, 'tienda'::TEXT as business_type, t.business_name, t.contact_name,
            t.description, t.address, t.phone, t.email, t.website,
            t.avatar_url, t.banner_url, t.verification_status, t.created_at
        FROM tiendas t
        WHERE ('tiendas' = ANY(business_types))
        AND (
            search_term = '' OR 
            t.business_name ILIKE '%' || search_term || '%' OR
            t.description ILIKE '%' || search_term || '%' OR
            t.contact_name ILIKE '%' || search_term || '%'
        )
        AND (
            search_location = '' OR 
            t.address ILIKE '%' || search_location || '%'
        )
        
        UNION ALL
        
        -- Buscar en academias
        SELECT 
            a.id, 'academia'::TEXT as business_type, a.business_name, a.contact_name,
            a.description, a.address, a.phone, a.email, a.website,
            a.avatar_url, a.banner_url, a.verification_status, a.created_at
        FROM academias a
        WHERE ('academias' = ANY(business_types))
        AND (
            search_term = '' OR 
            a.business_name ILIKE '%' || search_term || '%' OR
            a.description ILIKE '%' || search_term || '%' OR
            a.contact_name ILIKE '%' || search_term || '%'
        )
        AND (
            search_location = '' OR 
            a.address ILIKE '%' || search_location || '%'
        )
        
        UNION ALL
        
        -- Buscar en instalaciones
        SELECT 
            i.id, 'instalacion'::TEXT as business_type, i.business_name, i.contact_name,
            i.description, i.address, i.phone, i.email, i.website,
            i.avatar_url, i.banner_url, i.verification_status, i.created_at
        FROM instalaciones i
        WHERE ('instalaciones' = ANY(business_types))
        AND (
            search_term = '' OR 
            i.business_name ILIKE '%' || search_term || '%' OR
            i.description ILIKE '%' || search_term || '%' OR
            i.contact_name ILIKE '%' || search_term || '%'
        )
        AND (
            search_location = '' OR 
            i.address ILIKE '%' || search_location || '%'
        )
    )
    ORDER BY created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 2. FUNCIONES DE ESTADÍSTICAS GLOBALES
-- ===============================================

-- Función para obtener estadísticas completas del sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE(
    entity_type TEXT,
    total_count BIGINT,
    verified_count BIGINT,
    pending_count BIGINT,
    completed_onboarding BIGINT,
    created_today BIGINT,
    created_this_week BIGINT,
    created_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    -- Estadísticas de jugadores
    SELECT 
        'players'::TEXT as entity_type,
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_count,
        COUNT(*) FILTER (WHERE verification_status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE onboarding_complete = true)::BIGINT as completed_onboarding,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as created_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as created_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as created_this_month
    FROM players
    
    UNION ALL
    
    -- Estadísticas de clubs
    SELECT 
        'clubs'::TEXT as entity_type,
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_count,
        COUNT(*) FILTER (WHERE verification_status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE onboarding_complete = true)::BIGINT as completed_onboarding,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as created_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as created_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as created_this_month
    FROM clubs
    
    UNION ALL
    
    -- Estadísticas de tiendas
    SELECT 
        'tiendas'::TEXT as entity_type,
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE verification_status = 'verified')::BIGINT as verified_count,
        COUNT(*) FILTER (WHERE verification_status = 'pending')::BIGINT as pending_count,
        COUNT(*) FILTER (WHERE onboarding_complete = true)::BIGINT as completed_onboarding,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as created_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as created_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as created_this_month
    FROM tiendas
    
    UNION ALL
    
    -- Estadísticas de academias (no tienen verification_status ni onboarding_complete)
    SELECT 
        'academias'::TEXT as entity_type,
        COUNT(*)::BIGINT as total_count,
        0::BIGINT as verified_count,  -- No tienen verification_status
        COUNT(*)::BIGINT as pending_count,  -- Todas se consideran pending
        COUNT(*)::BIGINT as completed_onboarding,  -- Todas se consideran completas
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as created_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as created_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as created_this_month
    FROM academias
    
    UNION ALL
    
    -- Estadísticas de instalaciones (no tienen verification_status ni onboarding_complete)
    SELECT 
        'instalaciones'::TEXT as entity_type,
        COUNT(*)::BIGINT as total_count,
        0::BIGINT as verified_count,  -- No tienen verification_status
        COUNT(*)::BIGINT as pending_count,  -- Todas se consideran pending
        COUNT(*)::BIGINT as completed_onboarding,  -- Todas se consideran completas
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE)::BIGINT as created_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as created_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT as created_this_month
    FROM instalaciones
    
    ORDER BY entity_type;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 3. FUNCIÓN DE PERFIL UNIFICADO DE USUARIO
-- ===============================================

-- Función para obtener el perfil completo de un usuario
CREATE OR REPLACE FUNCTION get_user_complete_profile(user_uuid UUID)
RETURNS TABLE(
    profile_type TEXT,
    profile_data JSONB
) AS $$
BEGIN
    -- Buscar si es jugador
    IF EXISTS (SELECT 1 FROM players WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'player'::TEXT as profile_type,
            jsonb_build_object(
                'id', p.id,
                'full_name', p.full_name,
                'ubicacion', p.ubicacion,
                'telefono', p.telefono,
                'nivel', p.nivel,
                'experiencia', p.experiencia,
                'avatar_url', p.avatar_url,
                'banner_url', p.banner_url,
                'verification_status', p.verification_status,
                'onboarding_complete', p.onboarding_complete,
                'created_at', p.created_at
            ) as profile_data
        FROM players p
        WHERE p.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- Buscar si es club
    IF EXISTS (SELECT 1 FROM clubs WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'club'::TEXT as profile_type,
            jsonb_build_object(
                'id', c.id,
                'business_name', c.business_name,
                'contact_name', c.contact_name,
                'address', c.address,
                'phone', c.phone,
                'email', c.email,
                'number_of_courts', c.number_of_courts,
                'avatar_url', c.avatar_url,
                'banner_url', c.banner_url,
                'verification_status', c.verification_status,
                'onboarding_complete', c.onboarding_complete,
                'created_at', c.created_at
            ) as profile_data
        FROM clubs c
        WHERE c.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- Buscar si es tienda
    IF EXISTS (SELECT 1 FROM tiendas WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'tienda'::TEXT as profile_type,
            jsonb_build_object(
                'id', t.id,
                'business_name', t.business_name,
                'contact_name', t.contact_name,
                'address', t.address,
                'phone', t.phone,
                'email', t.email,
                'years_experience', t.years_experience,
                'avatar_url', t.avatar_url,
                'banner_url', t.banner_url,
                'verification_status', t.verification_status,
                'onboarding_complete', t.onboarding_complete,
                'created_at', t.created_at
            ) as profile_data
        FROM tiendas t
        WHERE t.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- Buscar si es academia
    IF EXISTS (SELECT 1 FROM academias WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'academia'::TEXT as profile_type,
            jsonb_build_object(
                'id', a.id,
                'business_name', a.business_name,
                'contact_name', a.contact_name,
                'address', a.address,
                'phone', a.phone,
                'email', a.email,
                'years_experience', a.years_experience,
                'avatar_url', a.avatar_url,
                'banner_url', a.banner_url,
                'verification_status', 'pending',  -- Academias no tienen verification_status
                'onboarding_complete', true,  -- Academias no tienen onboarding_complete
                'created_at', a.created_at
            ) as profile_data
        FROM academias a
        WHERE a.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- Buscar si es instalación
    IF EXISTS (SELECT 1 FROM instalaciones WHERE user_id = user_uuid) THEN
        RETURN QUERY
        SELECT 
            'instalacion'::TEXT as profile_type,
            jsonb_build_object(
                'id', i.id,
                'business_name', i.business_name,
                'contact_name', i.contact_name,
                'address', i.address,
                'phone', i.phone,
                'email', i.email,
                'years_experience', i.years_experience,
                'avatar_url', i.avatar_url,
                'banner_url', i.banner_url,
                'verification_status', 'pending',  -- Instalaciones no tienen verification_status
                'onboarding_complete', true,  -- Instalaciones no tienen onboarding_complete
                'created_at', i.created_at
            ) as profile_data
        FROM instalaciones i
        WHERE i.user_id = user_uuid;
        RETURN;
    END IF;
    
    -- Si no se encuentra perfil
    RETURN QUERY
    SELECT 
        'none'::TEXT as profile_type,
        '{}'::JSONB as profile_data;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 4. VISTAS GLOBALES ÚTILES
-- ===============================================

-- Vista unificada de todos los negocios
-- NOTA: Esta vista requiere que todas las tablas de negocios estén creadas primero
-- (clubs, tiendas, academias, instalaciones)
DO $$
BEGIN
    -- Verificar que todas las tablas existen antes de crear la vista
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('clubs', 'tiendas', 'academias', 'instalaciones') 
        AND table_schema = 'public'
        GROUP BY table_schema
        HAVING COUNT(*) = 4
    ) THEN
        EXECUTE '
        CREATE OR REPLACE VIEW all_businesses AS
        SELECT 
            c.id, ''club'' as business_type, c.business_name, c.contact_name, 
            c.description, c.address, c.phone, c.email, c.website, c.avatar_url, c.banner_url,
            c.verification_status, c.onboarding_complete, c.created_at, c.updated_at
        FROM clubs c
        UNION ALL
        SELECT 
            t.id, ''tienda'' as business_type, t.business_name, t.contact_name,
            t.description, t.address, t.phone, t.email, t.website, t.avatar_url, t.banner_url,
            t.verification_status, t.onboarding_complete, t.created_at, t.updated_at
        FROM tiendas t
        UNION ALL
        SELECT 
            a.id, ''academia'' as business_type, a.business_name, a.contact_name,
            a.description, a.address, a.phone, a.email, a.website, a.avatar_url, a.banner_url,
            ''pending''::VARCHAR(20) as verification_status, true as onboarding_complete, a.created_at, a.updated_at
        FROM academias a
        UNION ALL
        SELECT 
            i.id, ''instalacion'' as business_type, i.business_name, i.contact_name,
            i.description, i.address, i.phone, i.email, i.website, i.avatar_url, i.banner_url,
            ''pending''::VARCHAR(20) as verification_status, true as onboarding_complete, i.created_at, i.updated_at
        FROM instalaciones i';
        
        RAISE NOTICE 'Vista all_businesses creada correctamente';
    ELSE
        RAISE WARNING 'No se puede crear la vista all_businesses. Asegúrate de ejecutar primero los scripts 02, 03, 04 y 05';
    END IF;
END $$;

-- Vista de resumen de actividad reciente
-- NOTA: Esta vista depende de la vista all_businesses
DO $$
BEGIN
    -- Verificar que la vista all_businesses existe
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'all_businesses' 
        AND table_schema = 'public'
    ) THEN
        EXECUTE '
        CREATE OR REPLACE VIEW recent_activity AS
        SELECT 
            ''player'' as entity_type, 
            full_name as name,
            created_at,
            verification_status,
            onboarding_complete
        FROM players
        WHERE created_at >= CURRENT_DATE - INTERVAL ''7 days''
        UNION ALL
        SELECT 
            ''business'' as entity_type,
            business_name as name,
            created_at,
            verification_status,
            onboarding_complete
        FROM all_businesses
        WHERE created_at >= CURRENT_DATE - INTERVAL ''7 days''
        ORDER BY created_at DESC
        LIMIT 100';
        
        RAISE NOTICE 'Vista recent_activity creada correctamente';
    ELSE
        RAISE WARNING 'No se puede crear la vista recent_activity porque all_businesses no existe';
    END IF;
END $$;

-- ===============================================
-- 5. FUNCIONES DE UTILIDAD
-- ===============================================

-- Función para limpiar datos de prueba
CREATE OR REPLACE FUNCTION clean_test_data()
RETURNS TEXT AS $$
DECLARE
    players_deleted INTEGER;
    clubs_deleted INTEGER;
    tiendas_deleted INTEGER;
    academias_deleted INTEGER;
    instalaciones_deleted INTEGER;
BEGIN
    -- Eliminar datos de prueba (solo si email contiene 'test' o 'ejemplo')
    DELETE FROM players WHERE email ILIKE '%test%' OR email ILIKE '%ejemplo%';
    GET DIAGNOSTICS players_deleted = ROW_COUNT;
    
    DELETE FROM clubs WHERE email ILIKE '%test%' OR email ILIKE '%ejemplo%';
    GET DIAGNOSTICS clubs_deleted = ROW_COUNT;
    
    DELETE FROM tiendas WHERE email ILIKE '%test%' OR email ILIKE '%ejemplo%';
    GET DIAGNOSTICS tiendas_deleted = ROW_COUNT;
    
    DELETE FROM academias WHERE email ILIKE '%test%' OR email ILIKE '%ejemplo%';
    GET DIAGNOSTICS academias_deleted = ROW_COUNT;
    
    DELETE FROM instalaciones WHERE email ILIKE '%test%' OR email ILIKE '%ejemplo%';
    GET DIAGNOSTICS instalaciones_deleted = ROW_COUNT;
    
    RETURN format('Datos de prueba eliminados: %s players, %s clubs, %s tiendas, %s academias, %s instalaciones',
                  players_deleted, clubs_deleted, tiendas_deleted, academias_deleted, instalaciones_deleted);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener métricas de rendimiento
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE(
    metric_name TEXT,
    metric_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total de tablas'::TEXT, COUNT(*)::TEXT
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    SELECT 'Total de índices'::TEXT, COUNT(*)::TEXT
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    SELECT 'Total de políticas RLS'::TEXT, COUNT(*)::TEXT
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    SELECT 'Total de funciones'::TEXT, COUNT(*)::TEXT
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_name LIKE '%search%' OR routine_name LIKE '%get_%' OR routine_name LIKE '%find_%';
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- CONFIRMACIÓN
-- ===============================================

SELECT 'Funciones globales creadas correctamente' as resultado,
       'Sistema de búsqueda unificada, estadísticas y utilidades disponibles' as detalles,
       'Listo para ejecutar: 08_verificacion_completa.sql' as siguiente_paso;

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 08_verificacion_completa.sql
-- =============================================== 