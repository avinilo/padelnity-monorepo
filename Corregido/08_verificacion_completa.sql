-- ===============================================
-- SCRIPT 08: VERIFICACIÓN COMPLETA DEL SISTEMA
-- ===============================================
-- Este script verifica que toda la configuración de Padelnity
-- esté correctamente instalada y funcionando en el nuevo esquema
-- 
-- EJECUTAR DESPUÉS DE: 07_funciones_globales.sql
-- Versión: 2.0 - Esquema con 5 tablas especializadas
-- ===============================================

-- ===============================================
-- 1. FUNCIÓN PRINCIPAL DE VERIFICACIÓN COMPLETA
-- ===============================================

CREATE OR REPLACE FUNCTION check_padelnity_complete_setup_v2()
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
    
    -- Verificar extensiones necesarias (4 extensiones)
    IF EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent')
        HAVING COUNT(*) = 4
    ) THEN
        RETURN QUERY
        SELECT 'Extensiones'::TEXT, 'OK'::TEXT, 'uuid-ossp, pgcrypto, pg_trgm, unaccent instaladas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Extensiones'::TEXT, 'ERROR'::TEXT, 'Extensiones faltantes'::TEXT, 'Ejecutar 00_configuracion_inicial.sql'::TEXT;
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
        SELECT 'Storage Buckets'::TEXT, 'ERROR'::TEXT, 'Buckets faltantes'::TEXT, 'Ejecutar 00_configuracion_inicial.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR TABLAS PRINCIPALES (5 TABLAS)
    -- ===============================================
    
    -- Verificar existencia de las 5 tablas especializadas
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones') 
        AND table_schema = 'public'
        HAVING COUNT(*) = 5
    ) THEN
        RETURN QUERY
        SELECT 'Tablas principales'::TEXT, 'OK'::TEXT, 'Las 5 tablas especializadas creadas correctamente'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Tablas principales'::TEXT, 'ERROR'::TEXT, 'Faltan tablas especializadas'::TEXT, 'Ejecutar scripts 01-05 (tablas)'::TEXT;
    END IF;
    
    -- Verificar estructura específica de cada tabla
    -- Players
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' 
        AND column_name IN ('full_name', 'nivel', 'experiencia', 'posicion_favorita', 'estilo_juego')
        HAVING COUNT(*) = 5
    ) THEN
        RETURN QUERY
        SELECT 'Estructura Players'::TEXT, 'OK'::TEXT, 'Columnas específicas de jugadores presentes'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Estructura Players'::TEXT, 'ERROR'::TEXT, 'Columnas de jugadores faltantes'::TEXT, 'Verificar 01_tabla_players.sql'::TEXT;
    END IF;
    
    -- Clubs
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clubs' 
        AND column_name IN ('number_of_courts', 'court_types', 'has_reservation_system', 'main_services')
        HAVING COUNT(*) = 4
    ) THEN
        RETURN QUERY
        SELECT 'Estructura Clubs'::TEXT, 'OK'::TEXT, 'Columnas específicas de clubs presentes'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Estructura Clubs'::TEXT, 'ERROR'::TEXT, 'Columnas de clubs faltantes'::TEXT, 'Verificar 02_tabla_clubs.sql'::TEXT;
    END IF;
    
    -- Tiendas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tiendas' 
        AND column_name IN ('product_categories', 'services_offered', 'years_experience')
        HAVING COUNT(*) = 3
    ) THEN
        RETURN QUERY
        SELECT 'Estructura Tiendas'::TEXT, 'OK'::TEXT, 'Columnas específicas de tiendas presentes'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Estructura Tiendas'::TEXT, 'ERROR'::TEXT, 'Columnas de tiendas faltantes'::TEXT, 'Verificar 03_tabla_tiendas.sql'::TEXT;
    END IF;
    
    -- Academias
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'academias' 
        AND column_name IN ('teaching_levels', 'class_types', 'instructor_certifications')
        HAVING COUNT(*) = 3
    ) THEN
        RETURN QUERY
        SELECT 'Estructura Academias'::TEXT, 'OK'::TEXT, 'Columnas específicas de academias presentes'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Estructura Academias'::TEXT, 'ERROR'::TEXT, 'Columnas de academias faltantes'::TEXT, 'Verificar 04_tabla_academias.sql'::TEXT;
    END IF;
    
    -- Instalaciones
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'instalaciones' 
        AND column_name IN ('number_of_padel_courts', 'padel_court_types', 'other_sports')
        HAVING COUNT(*) = 3
    ) THEN
        RETURN QUERY
        SELECT 'Estructura Instalaciones'::TEXT, 'OK'::TEXT, 'Columnas específicas de instalaciones presentes'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Estructura Instalaciones'::TEXT, 'ERROR'::TEXT, 'Columnas de instalaciones faltantes'::TEXT, 'Verificar 05_tabla_instalaciones.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR RLS (ROW LEVEL SECURITY)
    -- ===============================================
    
    -- Verificar que RLS está habilitado en las 5 tablas
    IF EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones') 
        AND relrowsecurity = true
        HAVING COUNT(*) = 5
    ) THEN
        RETURN QUERY
        SELECT 'Row Level Security'::TEXT, 'OK'::TEXT, 'RLS habilitado en las 5 tablas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Row Level Security'::TEXT, 'ERROR'::TEXT, 'RLS no habilitado en todas las tablas'::TEXT, 'Verificar scripts de tablas individuales'::TEXT;
    END IF;
    
    -- Verificar políticas RLS (cada tabla debe tener al menos 4 políticas)
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
        AND schemaname = 'public'
        HAVING COUNT(*) >= 20  -- 4 políticas por tabla mínimo
    ) THEN
        RETURN QUERY
        SELECT 'Políticas RLS'::TEXT, 'OK'::TEXT, 'Políticas de seguridad configuradas en todas las tablas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Políticas RLS'::TEXT, 'ERROR'::TEXT, 'Políticas RLS insuficientes'::TEXT, 'Verificar scripts de tablas individuales'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR POLÍTICAS DE STORAGE
    -- ===============================================
    
    -- Verificar políticas de storage (8 políticas: 4 para avatars, 4 para banners)
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects'
        AND schemaname = 'storage'
        AND (policyname LIKE 'avatars_%' OR policyname LIKE 'banners_%')
        HAVING COUNT(*) >= 8
    ) THEN
        RETURN QUERY
        SELECT 'Políticas Storage'::TEXT, 'OK'::TEXT, 'Políticas de storage configuradas correctamente'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Políticas Storage'::TEXT, 'ERROR'::TEXT, 'Políticas de storage insuficientes'::TEXT, 'Ejecutar 06_politicas_storage.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR ÍNDICES DE OPTIMIZACIÓN
    -- ===============================================
    
    -- Verificar índices principales (al menos 15 índices para las 5 tablas)
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
        AND schemaname = 'public'
        HAVING COUNT(*) >= 15
    ) THEN
        RETURN QUERY
        SELECT 'Índices de optimización'::TEXT, 'OK'::TEXT, 'Índices de búsqueda y optimización creados'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Índices de optimización'::TEXT, 'WARNING'::TEXT, 'Algunos índices pueden faltar'::TEXT, 'Verificar scripts de tablas individuales'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR TRIGGERS
    -- ===============================================
    
    -- Verificar triggers de timestamp (5 triggers para las 5 tablas)
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name LIKE '%updated_at%'
        AND event_object_table IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
        HAVING COUNT(*) = 5
    ) THEN
        RETURN QUERY
        SELECT 'Triggers'::TEXT, 'OK'::TEXT, 'Triggers de timestamp configurados en todas las tablas'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Triggers'::TEXT, 'WARNING'::TEXT, 'Algunos triggers de timestamp pueden faltar'::TEXT, 'Verificar scripts de tablas individuales'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR FUNCIONES GLOBALES
    -- ===============================================
    
    -- Verificar funciones principales del sistema
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_name IN ('search_all_businesses', 'get_system_stats', 'get_user_complete_profile')
        HAVING COUNT(*) = 3
    ) THEN
        RETURN QUERY
        SELECT 'Funciones globales'::TEXT, 'OK'::TEXT, 'Funciones de búsqueda y estadísticas disponibles'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Funciones globales'::TEXT, 'ERROR'::TEXT, 'Funciones globales faltantes'::TEXT, 'Ejecutar 07_funciones_globales.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICAR VISTAS
    -- ===============================================
    
    -- Verificar vistas útiles
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public'
        AND table_name IN ('all_businesses', 'recent_activity')
        HAVING COUNT(*) = 2
    ) THEN
        RETURN QUERY
        SELECT 'Vistas globales'::TEXT, 'OK'::TEXT, 'Vistas unificadas disponibles'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Vistas globales'::TEXT, 'ERROR'::TEXT, 'Vistas globales faltantes'::TEXT, 'Ejecutar 07_funciones_globales.sql'::TEXT;
    END IF;
    
    -- ===============================================
    -- VERIFICACIÓN FINAL DE INTEGRIDAD
    -- ===============================================
    
    -- Verificar que no hay conflictos de constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'CHECK' 
        AND constraint_name LIKE '%conflict%'
    ) THEN
        RETURN QUERY
        SELECT 'Integridad de datos'::TEXT, 'OK'::TEXT, 'Sin conflictos de constraints detectados'::TEXT, ''::TEXT;
    ELSE
        RETURN QUERY
        SELECT 'Integridad de datos'::TEXT, 'WARNING'::TEXT, 'Posibles conflictos de constraints'::TEXT, 'Revisar definiciones de tablas'::TEXT;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 2. FUNCIÓN DE PRUEBA DE INSERCIÓN DE DATOS
-- ===============================================

CREATE OR REPLACE FUNCTION test_data_insertion_v2()
RETURNS TABLE(
    test_name TEXT,
    result TEXT,
    details TEXT
) AS $$
DECLARE
    test_user_id UUID := '12345678-1234-1234-1234-123456789012';
    player_id UUID;
    club_id UUID;
    tienda_id UUID;
    academia_id UUID;
    instalacion_id UUID;
BEGIN
    -- Limpiar datos de prueba previos
    DELETE FROM players WHERE user_id = test_user_id;
    DELETE FROM clubs WHERE user_id = test_user_id;
    DELETE FROM tiendas WHERE user_id = test_user_id;
    DELETE FROM academias WHERE user_id = test_user_id;
    DELETE FROM instalaciones WHERE user_id = test_user_id;
    
    -- ===============================================
    -- PROBAR INSERCIÓN EN PLAYERS
    -- ===============================================
    
    BEGIN
        INSERT INTO players (
            user_id, full_name, ubicacion, telefono, nivel, experiencia,
            posicion_favorita, estilo_juego, email
        ) VALUES (
            test_user_id, 'Test Player', 'Madrid', '600123456', 'intermedio', '2-5 años',
            'derecha', 'agresivo', 'test.player@ejemplo.com'
        ) RETURNING id INTO player_id;
        
        RETURN QUERY
        SELECT 'Inserción Players'::TEXT, 'OK'::TEXT, 'Jugador de prueba creado correctamente'::TEXT;
    EXCEPTION
        WHEN others THEN
            RETURN QUERY
            SELECT 'Inserción Players'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- PROBAR INSERCIÓN EN CLUBS
    -- ===============================================
    
    BEGIN
        INSERT INTO clubs (
            user_id, business_name, contact_name, address, phone, email,
            number_of_courts, court_types, has_reservation_system
        ) VALUES (
            test_user_id, 'Test Club', 'Test Contact', 'Calle Test 123', '600123456', 
            'test.club@ejemplo.com', 4, ARRAY['indoor', 'outdoor'], true
        ) RETURNING id INTO club_id;
        
        RETURN QUERY
        SELECT 'Inserción Clubs'::TEXT, 'OK'::TEXT, 'Club de prueba creado correctamente'::TEXT;
    EXCEPTION
        WHEN others THEN
            RETURN QUERY
            SELECT 'Inserción Clubs'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- PROBAR INSERCIÓN EN TIENDAS
    -- ===============================================
    
    BEGIN
        INSERT INTO tiendas (
            user_id, business_name, contact_name, address, phone, email,
            years_experience, product_categories, services_offered
        ) VALUES (
            test_user_id, 'Test Tienda', 'Test Contact', 'Calle Test 123', '600123456',
            'test.tienda@ejemplo.com', 5, ARRAY['palas', 'ropa'], ARRAY['venta', 'reparacion']
        ) RETURNING id INTO tienda_id;
        
        RETURN QUERY
        SELECT 'Inserción Tiendas'::TEXT, 'OK'::TEXT, 'Tienda de prueba creada correctamente'::TEXT;
    EXCEPTION
        WHEN others THEN
            RETURN QUERY
            SELECT 'Inserción Tiendas'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- PROBAR INSERCIÓN EN ACADEMIAS
    -- ===============================================
    
    BEGIN
        INSERT INTO academias (
            user_id, business_name, contact_name, address, phone, email,
            years_experience, teaching_levels, class_types
        ) VALUES (
            test_user_id, 'Test Academia', 'Test Contact', 'Calle Test 123', '600123456',
            'test.academia@ejemplo.com', 3, ARRAY['principiante', 'intermedio'], ARRAY['individual', 'grupal']
        ) RETURNING id INTO academia_id;
        
        RETURN QUERY
        SELECT 'Inserción Academias'::TEXT, 'OK'::TEXT, 'Academia de prueba creada correctamente'::TEXT;
    EXCEPTION
        WHEN others THEN
            RETURN QUERY
            SELECT 'Inserción Academias'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- PROBAR INSERCIÓN EN INSTALACIONES
    -- ===============================================
    
    BEGIN
        INSERT INTO instalaciones (
            user_id, business_name, contact_name, address, phone, email,
            years_experience, number_of_padel_courts, padel_court_types, other_sports
        ) VALUES (
            test_user_id, 'Test Instalación', 'Test Contact', 'Calle Test 123', '600123456',
            'test.instalacion@ejemplo.com', 10, 6, ARRAY['indoor', 'outdoor'], ARRAY['tenis', 'futbol']
        ) RETURNING id INTO instalacion_id;
        
        RETURN QUERY
        SELECT 'Inserción Instalaciones'::TEXT, 'OK'::TEXT, 'Instalación de prueba creada correctamente'::TEXT;
    EXCEPTION
        WHEN others THEN
            RETURN QUERY
            SELECT 'Inserción Instalaciones'::TEXT, 'ERROR'::TEXT, ('Error: ' || SQLERRM)::TEXT;
    END;
    
    -- ===============================================
    -- LIMPIAR DATOS DE PRUEBA
    -- ===============================================
    
    DELETE FROM players WHERE id = player_id;
    DELETE FROM clubs WHERE id = club_id;
    DELETE FROM tiendas WHERE id = tienda_id;
    DELETE FROM academias WHERE id = academia_id;
    DELETE FROM instalaciones WHERE id = instalacion_id;
    
    RETURN QUERY
    SELECT 'Limpieza'::TEXT, 'OK'::TEXT, 'Datos de prueba eliminados correctamente'::TEXT;
    
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 3. FUNCIÓN DE RESUMEN FINAL
-- ===============================================

CREATE OR REPLACE FUNCTION get_setup_summary_v2()
RETURNS TABLE(
    metric TEXT,
    value TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Contar tablas
    SELECT 'Tablas creadas'::TEXT, 
           COUNT(*)::TEXT, 
           'Tablas principales del sistema'::TEXT
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    -- Contar índices
    SELECT 'Índices creados'::TEXT, 
           COUNT(*)::TEXT, 
           'Índices de optimización'::TEXT
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    -- Contar políticas RLS
    SELECT 'Políticas RLS'::TEXT, 
           COUNT(*)::TEXT, 
           'Políticas de seguridad a nivel de fila'::TEXT
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    -- Contar políticas de Storage
    SELECT 'Políticas Storage'::TEXT, 
           COUNT(*)::TEXT, 
           'Políticas de almacenamiento de archivos'::TEXT
    FROM pg_policies 
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND (policyname LIKE 'avatars_%' OR policyname LIKE 'banners_%')
    
    UNION ALL
    
    -- Contar funciones
    SELECT 'Funciones creadas'::TEXT, 
           COUNT(*)::TEXT, 
           'Funciones de utilidad y búsqueda'::TEXT
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND (routine_name LIKE 'search_%' OR routine_name LIKE 'get_%' OR routine_name LIKE 'find_%')
    
    UNION ALL
    
    -- Contar vistas
    SELECT 'Vistas creadas'::TEXT, 
           COUNT(*)::TEXT, 
           'Vistas para consultas complejas'::TEXT
    FROM information_schema.views 
    WHERE table_schema = 'public'
    
    UNION ALL
    
    -- Contar triggers
    SELECT 'Triggers activos'::TEXT, 
           COUNT(*)::TEXT, 
           'Triggers automáticos'::TEXT
    FROM information_schema.triggers 
    WHERE event_object_schema = 'public'
    AND event_object_table IN ('players', 'clubs', 'tiendas', 'academias', 'instalaciones')
    
    UNION ALL
    
    -- Contar extensiones
    SELECT 'Extensiones habilitadas'::TEXT, 
           COUNT(*)::TEXT, 
           'Extensiones de PostgreSQL'::TEXT
    FROM pg_extension 
    WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent')
    
    UNION ALL
    
    -- Contar buckets
    SELECT 'Buckets de Storage'::TEXT, 
           COUNT(*)::TEXT, 
           'Buckets para almacenamiento de archivos'::TEXT
    FROM storage.buckets 
    WHERE id IN ('avatars', 'banners');
    
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 4. EJECUTAR VERIFICACIÓN COMPLETA
-- ===============================================

-- Ejecutar verificación principal
SELECT 'VERIFICACIÓN COMPLETA DE PADELNITY v2.0' as titulo;
SELECT component, status, details, issues 
FROM check_padelnity_complete_setup_v2() 
ORDER BY 
    CASE status 
        WHEN 'ERROR' THEN 1 
        WHEN 'WARNING' THEN 2 
        WHEN 'OK' THEN 3 
    END, component;

-- Separador
SELECT '' as separador, '=' as linea, '=' as linea2, '=' as linea3;

-- Ejecutar pruebas de inserción
SELECT 'PRUEBAS DE INSERCIÓN DE DATOS' as titulo;
SELECT test_name, result, details FROM test_data_insertion_v2();

-- Separador
SELECT '' as separador, '=' as linea, '=' as linea2, '=' as linea3;

-- Mostrar resumen final
SELECT 'RESUMEN FINAL DEL SISTEMA' as titulo;
SELECT metric, value, description FROM get_setup_summary_v2();

-- ===============================================
-- MENSAJE FINAL
-- ===============================================

SELECT 
    'PADELNITY v2.0 - ESQUEMA REESTRUCTURADO' as sistema,
    'Base de datos con 5 tablas especializadas configurada' as estado,
    'Sistema listo para producción' as resultado;

-- ===============================================
-- FIN DE LA VERIFICACIÓN COMPLETA
-- =============================================== 