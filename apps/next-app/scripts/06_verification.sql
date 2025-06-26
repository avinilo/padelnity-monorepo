-- ===============================================
-- SCRIPT 06: VERIFICACIÓN COMPLETA DEL SISTEMA
-- ===============================================
-- Este script verifica que toda la configuración de Padelnity
-- esté correctamente instalada y funcionando
-- 
-- EJECUTAR DESPUÉS DE: 05_functions_views.sql
-- ===============================================

-- ===============================================
-- 1. FUNCIÓN PRINCIPAL DE VERIFICACIÓN
-- ===============================================

CREATE OR REPLACE FUNCTION check_padelnity_complete_setup()
RETURNS TABLE(
    component TEXT,
    status TEXT,
    details TEXT,
    issues TEXT
) AS $$
BEGIN
    -- ===============================================
    -- VERIFICAR EXTENSIONES
    -- ===============================================
    
    -- Verificar extensiones necesarias
    IF EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname IN ('uuid-ossp', 'pgcrypto')
        HAVING COUNT(*) = 2
    ) THEN
        RETURN QUERY
        SELECT 'Extensiones'::TEXT, 'OK'::TEXT, 'uuid-ossp y pgcrypto instaladas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Extensiones'::TEXT, 'ERROR'::TEXT, 'Extensiones faltantes'::TEXT, 'Ejecutar 01_initial_setup.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR STORAGE BUCKETS
    -- ===============================================
    
    -- Verificar buckets de storage
    IF EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id IN ('avatars', 'banners')
        HAVING COUNT(*) = 2
    ) THEN
        RETURN QUERY
        SELECT 'Storage Buckets'::TEXT, 'OK'::TEXT, 'Buckets avatars y banners creados'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Storage Buckets'::TEXT, 'ERROR'::TEXT, 'Buckets faltantes'::TEXT, 'Ejecutar 01_initial_setup.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR TABLAS
    -- ===============================================
    
    -- Verificar existencia de tablas principales
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('players', 'businesses') 
        AND table_schema = 'public'
        HAVING COUNT(*) = 2
    ) THEN
        RETURN QUERY
        SELECT 'Tablas principales'::TEXT, 'OK'::TEXT, 'Tablas players y businesses creadas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Tablas principales'::TEXT, 'ERROR'::TEXT, 'Tablas faltantes'::TEXT, 'Ejecutar 02_tables.sql'::TEXT;
    END IF;
    
    -- Verificar columnas específicas de businesses
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name IN ('business_type', 'number_of_padel_courts', 'padel_services', 'product_categories', 'teaching_levels')
        HAVING COUNT(*) = 5
    ) THEN
        RETURN QUERY
        SELECT 'Columnas específicas'::TEXT, 'OK'::TEXT, 'Todas las columnas específicas por tipo de negocio existen'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Columnas específicas'::TEXT, 'ERROR'::TEXT, 'Columnas específicas faltantes'::TEXT, 'Verificar 02_tables.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR CONSTRAINTS
    -- ===============================================
    
    -- Verificar constraints de players
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name IN ('players_nivel_check', 'players_experiencia_check', 'players_posicion_favorita_check')
    ) THEN
        RETURN QUERY
        SELECT 'Constraints Players'::TEXT, 'OK'::TEXT, 'Constraints de validación activos'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Constraints Players'::TEXT, 'WARNING'::TEXT, 'Algunos constraints pueden faltar'::TEXT, 'Verificar 02_tables.sql'::TEXT;
    END IF;
    
    -- Verificar constraint específico de instalaciones
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'instalacion_must_have_padel'
    ) THEN
        RETURN QUERY
        SELECT 'Constraint Instalaciones'::TEXT, 'OK'::TEXT, 'Validación de padel para instalaciones activa'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Constraint Instalaciones'::TEXT, 'WARNING'::TEXT, 'Constraint de instalaciones faltante'::TEXT, 'Verificar 02_tables.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR RLS (ROW LEVEL SECURITY)
    -- ===============================================
    
    -- Verificar que RLS está habilitado
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname IN ('players', 'businesses') 
        AND relrowsecurity = true
        HAVING COUNT(*) = 2
    ) THEN
        RETURN QUERY
        SELECT 'Row Level Security'::TEXT, 'OK'::TEXT, 'RLS habilitado en ambas tablas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Row Level Security'::TEXT, 'ERROR'::TEXT, 'RLS no habilitado'::TEXT, 'Ejecutar 03_rls_policies.sql'::TEXT;
    END IF;
    
    -- Verificar políticas RLS
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename IN ('players', 'businesses')
        AND schemaname = 'public'
        HAVING COUNT(*) >= 8
    ) THEN
        RETURN QUERY
        SELECT 'Políticas RLS'::TEXT, 'OK'::TEXT, 'Políticas de seguridad configuradas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Políticas RLS'::TEXT, 'ERROR'::TEXT, 'Políticas RLS insuficientes'::TEXT, 'Ejecutar 03_rls_policies.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR POLÍTICAS DE STORAGE
    -- ===============================================
    
    -- Verificar políticas de storage
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects'
        AND (policyname LIKE '%avatar%' OR policyname LIKE '%banner%')
        HAVING COUNT(*) >= 8
    ) THEN
        RETURN QUERY
        SELECT 'Políticas Storage'::TEXT, 'OK'::TEXT, 'Políticas de storage configuradas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Políticas Storage'::TEXT, 'ERROR'::TEXT, 'Políticas de storage insuficientes'::TEXT, 'Ejecutar 04_storage_policies.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR ÍNDICES
    -- ===============================================
    
    -- Verificar índices principales
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname IN ('idx_players_user_id', 'idx_businesses_user_id', 'idx_businesses_type')
        HAVING COUNT(*) = 3
    ) THEN
        RETURN QUERY
        SELECT 'Índices principales'::TEXT, 'OK'::TEXT, 'Índices de optimización creados'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Índices principales'::TEXT, 'WARNING'::TEXT, 'Algunos índices pueden faltar'::TEXT, 'Verificar 02_tables.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR TRIGGERS
    -- ===============================================
    
    -- Verificar triggers de timestamp
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name IN ('update_players_updated_at', 'update_businesses_updated_at')
        HAVING COUNT(*) = 2
    ) THEN
        RETURN QUERY
        SELECT 'Triggers'::TEXT, 'OK'::TEXT, 'Triggers de timestamp configurados'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Triggers'::TEXT, 'WARNING'::TEXT, 'Triggers de timestamp faltantes'::TEXT, 'Verificar 02_tables.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR VISTAS
    -- ===============================================
    
    -- Verificar vistas específicas
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name IN ('club_profiles', 'tienda_profiles', 'academia_profiles', 'instalacion_profiles')
        AND table_schema = 'public'
        HAVING COUNT(*) = 4
    ) THEN
        RETURN QUERY
        SELECT 'Vistas específicas'::TEXT, 'OK'::TEXT, 'Vistas por tipo de negocio creadas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Vistas específicas'::TEXT, 'ERROR'::TEXT, 'Vistas específicas faltantes'::TEXT, 'Ejecutar 05_functions_views.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR FUNCIONES
    -- ===============================================
    
    -- Verificar funciones principales
    IF EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name IN ('get_business_stats', 'get_player_stats', 'search_businesses', 'search_players', 'get_user_profile')
        AND routine_schema = 'public'
        HAVING COUNT(*) = 5
    ) THEN
        RETURN QUERY
        SELECT 'Funciones útiles'::TEXT, 'OK'::TEXT, 'Funciones de utilidad creadas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Funciones útiles'::TEXT, 'ERROR'::TEXT, 'Funciones faltantes'::TEXT, 'Ejecutar 05_functions_views.sql'::TEXT;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 2. FUNCIÓN DE PRUEBA DE INSERCIÓN
-- ===============================================

CREATE OR REPLACE FUNCTION test_data_insertion()
RETURNS TABLE(
    test_name TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    test_user_id UUID;
    player_id UUID;
    business_id UUID;
BEGIN
    -- Generar un UUID de prueba
    test_user_id := gen_random_uuid();
    
    -- ===============================================
    -- PRUEBA 1: INSERCIÓN DE JUGADOR
    -- ===============================================
    
    BEGIN
        INSERT INTO players (
            user_id, 
            full_name, 
            nivel, 
            experiencia, 
            posicion_favorita,
            onboarding_complete
        ) VALUES (
            test_user_id, 
            'Test Player', 
            'principiante', 
            '< 1 año', 
            'cualquiera',
            false
        ) RETURNING id INTO player_id;
        
        RETURN QUERY
        SELECT 'Inserción Player'::TEXT, 'OK'::TEXT, 'Jugador de prueba creado correctamente'::TEXT;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 'Inserción Player'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- PRUEBA 2: INSERCIÓN DE NEGOCIO (CLUB)
    -- ===============================================
    
    BEGIN
        -- Usar otro user_id para el negocio
        test_user_id := gen_random_uuid();
        
        INSERT INTO businesses (
            user_id,
            business_type,
            business_name,
            contact_name,
            address,
            phone,
            horario_apertura,
            horario_cierre,
            main_services,
            onboarding_complete
        ) VALUES (
            test_user_id,
            'club',
            'Test Club',
            'Test Contact',
            'Test Address',
            '+34 123 456 789',
            '08:00',
            '22:00',
            '["clases-particulares", "torneos"]'::jsonb,
            false
        ) RETURNING id INTO business_id;
        
        RETURN QUERY
        SELECT 'Inserción Business'::TEXT, 'OK'::TEXT, 'Negocio de prueba creado correctamente'::TEXT;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 'Inserción Business'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- LIMPIAR DATOS DE PRUEBA
    -- ===============================================
    
    DELETE FROM players WHERE id = player_id;
    DELETE FROM businesses WHERE id = business_id;
    
    RETURN QUERY
    SELECT 'Limpieza'::TEXT, 'OK'::TEXT, 'Datos de prueba eliminados'::TEXT;
    
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 3. FUNCIÓN DE ESTADÍSTICAS GENERALES
-- ===============================================

CREATE OR REPLACE FUNCTION get_setup_summary()
RETURNS TABLE(
    metric TEXT,
    value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total de tablas'::TEXT, COUNT(*)::TEXT
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('players', 'businesses');
    
    RETURN QUERY
    SELECT 'Total de vistas'::TEXT, COUNT(*)::TEXT
    FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name LIKE '%_profiles';
    
    RETURN QUERY
    SELECT 'Total de funciones'::TEXT, COUNT(*)::TEXT
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name LIKE '%_stats' OR routine_name LIKE 'search_%';
    
    RETURN QUERY
    SELECT 'Políticas RLS'::TEXT, COUNT(*)::TEXT
    FROM pg_policies 
    WHERE tablename IN ('players', 'businesses') AND schemaname = 'public';
    
    RETURN QUERY
    SELECT 'Políticas Storage'::TEXT, COUNT(*)::TEXT
    FROM pg_policies 
    WHERE tablename = 'objects' AND (policyname LIKE '%avatar%' OR policyname LIKE '%banner%');
    
    RETURN QUERY
    SELECT 'Storage Buckets'::TEXT, COUNT(*)::TEXT
    FROM storage.buckets 
    WHERE id IN ('avatars', 'banners');
    
    RETURN QUERY
    SELECT 'Versión PostgreSQL'::TEXT, version() as value;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 4. EJECUTAR VERIFICACIÓN COMPLETA
-- ===============================================

-- Ejecutar verificación principal
SELECT '========================================' as separator;
SELECT 'VERIFICACIÓN COMPLETA DE PADELNITY' as title;
SELECT '========================================' as separator;

SELECT * FROM check_padelnity_complete_setup();

SELECT '========================================' as separator;
SELECT 'PRUEBA DE INSERCIÓN DE DATOS' as title;
SELECT '========================================' as separator;

SELECT * FROM test_data_insertion();

SELECT '========================================' as separator;
SELECT 'RESUMEN DE CONFIGURACIÓN' as title;
SELECT '========================================' as separator;

SELECT * FROM get_setup_summary();

-- ===============================================
-- 5. INFORMACIÓN ADICIONAL PARA EL DESARROLLADOR
-- ===============================================

SELECT '========================================' as separator;
SELECT 'INFORMACIÓN ADICIONAL' as title;
SELECT '========================================' as separator;

SELECT 'Configuración completada' as info, 
       'La base de datos de Padelnity está lista para usar' as details;

SELECT 'Siguiente paso' as info, 
       'Configurar variables de entorno en tu aplicación Next.js' as details;

SELECT 'Variables necesarias' as info, 
       'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY' as details;

SELECT 'Configuración de Auth' as info, 
       'Configurar URLs de callback en Dashboard > Authentication > Settings' as details;

-- ===============================================
-- MENSAJES FINALES
-- ===============================================

DO $$
BEGIN
    -- Verificar si todo está OK
    IF EXISTS (
        SELECT 1 FROM check_padelnity_complete_setup() 
        WHERE status = 'ERROR'
    ) THEN
        RAISE NOTICE '⚠️  ATENCIÓN: Hay errores en la configuración. Revisa los resultados arriba.';
    ELSE
        RAISE NOTICE '✅ ÉXITO: La configuración de Padelnity está completa y funcionando correctamente.';
    END IF;
END $$;

-- ===============================================
-- FUNCIONES DISPONIBLES PARA USO:
-- ===============================================
-- 
-- Estadísticas:
-- SELECT * FROM get_business_stats();
-- SELECT * FROM get_player_stats();
-- SELECT * FROM get_daily_stats(30);
-- 
-- Búsquedas:
-- SELECT * FROM search_businesses('Madrid', ARRAY['clases-particulares'], ARRAY['club']);
-- SELECT * FROM search_players('intermedio', 'Barcelona', '1-3 años');
-- 
-- Utilidades:
-- SELECT * FROM get_user_profile('user-uuid-here');
-- 
-- Vistas específicas:
-- SELECT * FROM club_profiles;
-- SELECT * FROM tienda_profiles;
-- SELECT * FROM academia_profiles;
-- SELECT * FROM instalacion_profiles;
-- 
-- =============================================== 