-- ===============================================
-- SCRIPT 09: REDES SOCIALES Y URLS PERMISIVAS
-- ===============================================
-- Este script agrega campos de redes sociales a todas las tablas
-- y hace las validaciones de URL más permisivas
-- 
-- EJECUTAR DESPUÉS DE: 08_verificacion_completa.sql
-- ===============================================

-- ===============================================
-- 1. AGREGAR REDES SOCIALES A TABLA PLAYERS
-- ===============================================

-- Agregar columnas de redes sociales para jugadores
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255), 
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255);

-- Comentarios para las nuevas columnas
COMMENT ON COLUMN players.instagram_url IS 'URL del perfil de Instagram del jugador';
COMMENT ON COLUMN players.facebook_url IS 'URL del perfil de Facebook del jugador';
COMMENT ON COLUMN players.twitter_url IS 'URL del perfil de Twitter del jugador';

-- ===============================================
-- 2. AGREGAR REDES SOCIALES A TABLA CLUBS
-- ===============================================

-- Agregar columnas de redes sociales para clubes (incluye LinkedIn)
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

-- Comentarios para las nuevas columnas
COMMENT ON COLUMN clubs.instagram_url IS 'URL del perfil de Instagram del club';
COMMENT ON COLUMN clubs.facebook_url IS 'URL del perfil de Facebook del club';
COMMENT ON COLUMN clubs.twitter_url IS 'URL del perfil de Twitter del club';
COMMENT ON COLUMN clubs.linkedin_url IS 'URL del perfil de LinkedIn del club';

-- ===============================================
-- 3. AGREGAR REDES SOCIALES A TABLA TIENDAS
-- ===============================================

-- Agregar columnas de redes sociales para tiendas (incluye LinkedIn)
ALTER TABLE tiendas 
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

-- Comentarios para las nuevas columnas
COMMENT ON COLUMN tiendas.instagram_url IS 'URL del perfil de Instagram de la tienda';
COMMENT ON COLUMN tiendas.facebook_url IS 'URL del perfil de Facebook de la tienda';
COMMENT ON COLUMN tiendas.twitter_url IS 'URL del perfil de Twitter de la tienda';
COMMENT ON COLUMN tiendas.linkedin_url IS 'URL del perfil de LinkedIn de la tienda';

-- ===============================================
-- 4. AGREGAR REDES SOCIALES A TABLA ACADEMIAS
-- ===============================================

-- Agregar columnas de redes sociales para academias (incluye LinkedIn)
ALTER TABLE academias 
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

-- Comentarios para las nuevas columnas
COMMENT ON COLUMN academias.instagram_url IS 'URL del perfil de Instagram de la academia';
COMMENT ON COLUMN academias.facebook_url IS 'URL del perfil de Facebook de la academia';
COMMENT ON COLUMN academias.twitter_url IS 'URL del perfil de Twitter de la academia';
COMMENT ON COLUMN academias.linkedin_url IS 'URL del perfil de LinkedIn de la academia';

-- ===============================================
-- 5. AGREGAR REDES SOCIALES A TABLA INSTALACIONES
-- ===============================================

-- Agregar columnas de redes sociales para instalaciones (incluye LinkedIn)
ALTER TABLE instalaciones 
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

-- Comentarios para las nuevas columnas
COMMENT ON COLUMN instalaciones.instagram_url IS 'URL del perfil de Instagram de la instalación';
COMMENT ON COLUMN instalaciones.facebook_url IS 'URL del perfil de Facebook de la instalación';
COMMENT ON COLUMN instalaciones.twitter_url IS 'URL del perfil de Twitter de la instalación';
COMMENT ON COLUMN instalaciones.linkedin_url IS 'URL del perfil de LinkedIn de la instalación';

-- ===============================================
-- 6. CREAR FUNCIÓN PARA NORMALIZAR URLS
-- ===============================================

CREATE OR REPLACE FUNCTION normalize_url(input_url TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Si la URL es NULL o vacía, retornar NULL
    IF input_url IS NULL OR trim(input_url) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Limpiar espacios
    input_url := trim(input_url);
    
    -- Si ya tiene protocolo, devolverla tal como está
    IF input_url ILIKE 'http://%' OR input_url ILIKE 'https://%' THEN
        RETURN input_url;
    END IF;
    
    -- Si empieza con www., agregar https://
    IF input_url ILIKE 'www.%' THEN
        RETURN 'https://' || input_url;
    END IF;
    
    -- Si contiene un punto y no tiene protocolo, agregar https://
    IF position('.' in input_url) > 0 THEN
        RETURN 'https://' || input_url;
    END IF;
    
    -- En cualquier otro caso, retornar la URL original
    RETURN input_url;
END;
$$ LANGUAGE plpgsql;

-- Comentario para la función
COMMENT ON FUNCTION normalize_url(TEXT) IS 'Función que normaliza URLs agregando https:// cuando es necesario';

-- ===============================================
-- 7. ACTUALIZAR VALIDACIONES DE URL MÁS PERMISIVAS
-- ===============================================

-- Función para validar URLs de manera más permisiva
CREATE OR REPLACE FUNCTION is_valid_url(input_url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Si es NULL o vacío, es válido
    IF input_url IS NULL OR trim(input_url) = '' THEN
        RETURN TRUE;
    END IF;
    
    -- Limpiar espacios
    input_url := trim(input_url);
    
    -- Validar patrones básicos más permisivos
    RETURN (
        -- URLs con protocolo
        input_url ~ '^https?://.+\..+$' OR
        -- URLs con www.
        input_url ~ '^www\..+\..+$' OR  
        -- URLs simples con dominio
        input_url ~ '^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}.*$' OR
        -- URLs de redes sociales sin protocolo
        input_url ~ '^(instagram\.com|facebook\.com|twitter\.com|linkedin\.com)/.+$'
    );
END;
$$ LANGUAGE plpgsql;

-- Comentario para la función
COMMENT ON FUNCTION is_valid_url(TEXT) IS 'Función que valida URLs de manera permisiva, permitiendo dominios sin https://';

-- ===============================================
-- 8. ELIMINAR RESTRICCIONES ESTRICTAS DE URL
-- ===============================================

-- CLUBS: Eliminar restricciones estrictas de website
DO $$
BEGIN
    -- Eliminar constraint de website si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_website_format' 
        AND table_name = 'clubs'
    ) THEN
        ALTER TABLE clubs DROP CONSTRAINT valid_website_format;
    END IF;
    
    -- Eliminar constraint de reservation_web si existe  
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_reservation_web' 
        AND table_name = 'clubs'
    ) THEN
        ALTER TABLE clubs DROP CONSTRAINT valid_reservation_web;
    END IF;
END $$;

-- TIENDAS: Eliminar restricciones estrictas de website
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_website_format' 
        AND table_name = 'tiendas'
    ) THEN
        ALTER TABLE tiendas DROP CONSTRAINT valid_website_format;
    END IF;
END $$;

-- ACADEMIAS: Eliminar restricciones estrictas de website
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_website_format' 
        AND table_name = 'academias'
    ) THEN
        ALTER TABLE academias DROP CONSTRAINT valid_website_format;
    END IF;
END $$;

-- INSTALACIONES: Eliminar restricciones estrictas de website
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_website_format' 
        AND table_name = 'instalaciones'
    ) THEN
        ALTER TABLE instalaciones DROP CONSTRAINT valid_website_format;
    END IF;
END $$;

-- ===============================================
-- 9. AGREGAR NUEVAS VALIDACIONES PERMISIVAS
-- ===============================================

-- CLUBS: Agregar validaciones permisivas
ALTER TABLE clubs
ADD CONSTRAINT valid_website_format_permissive 
CHECK (is_valid_url(website)),
ADD CONSTRAINT valid_reservation_web_permissive 
CHECK (is_valid_url(reservation_web)),
ADD CONSTRAINT valid_instagram_url 
CHECK (is_valid_url(instagram_url)),
ADD CONSTRAINT valid_facebook_url 
CHECK (is_valid_url(facebook_url)),
ADD CONSTRAINT valid_twitter_url 
CHECK (is_valid_url(twitter_url)),
ADD CONSTRAINT valid_linkedin_url 
CHECK (is_valid_url(linkedin_url));

-- TIENDAS: Agregar validaciones permisivas
ALTER TABLE tiendas
ADD CONSTRAINT valid_website_format_permissive 
CHECK (is_valid_url(website)),
ADD CONSTRAINT valid_instagram_url 
CHECK (is_valid_url(instagram_url)),
ADD CONSTRAINT valid_facebook_url 
CHECK (is_valid_url(facebook_url)),
ADD CONSTRAINT valid_twitter_url 
CHECK (is_valid_url(twitter_url)),
ADD CONSTRAINT valid_linkedin_url 
CHECK (is_valid_url(linkedin_url));

-- ACADEMIAS: Agregar validaciones permisivas
ALTER TABLE academias
ADD CONSTRAINT valid_website_format_permissive 
CHECK (is_valid_url(website)),
ADD CONSTRAINT valid_instagram_url 
CHECK (is_valid_url(instagram_url)),
ADD CONSTRAINT valid_facebook_url 
CHECK (is_valid_url(facebook_url)),
ADD CONSTRAINT valid_twitter_url 
CHECK (is_valid_url(twitter_url)),
ADD CONSTRAINT valid_linkedin_url 
CHECK (is_valid_url(linkedin_url));

-- INSTALACIONES: Agregar validaciones permisivas
ALTER TABLE instalaciones
ADD CONSTRAINT valid_website_format_permissive 
CHECK (is_valid_url(website)),
ADD CONSTRAINT valid_instagram_url 
CHECK (is_valid_url(instagram_url)),
ADD CONSTRAINT valid_facebook_url 
CHECK (is_valid_url(facebook_url)),
ADD CONSTRAINT valid_twitter_url 
CHECK (is_valid_url(twitter_url)),
ADD CONSTRAINT valid_linkedin_url 
CHECK (is_valid_url(linkedin_url));

-- PLAYERS: Agregar validaciones para redes sociales
ALTER TABLE players
ADD CONSTRAINT valid_instagram_url 
CHECK (is_valid_url(instagram_url)),
ADD CONSTRAINT valid_facebook_url 
CHECK (is_valid_url(facebook_url)),
ADD CONSTRAINT valid_twitter_url 
CHECK (is_valid_url(twitter_url));

-- ===============================================
-- 10. CREAR TRIGGERS PARA NORMALIZACIÓN AUTOMÁTICA
-- ===============================================

-- Función de trigger para normalizar URLs automáticamente
CREATE OR REPLACE FUNCTION normalize_urls_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalizar URLs en players
    IF TG_TABLE_NAME = 'players' THEN
        NEW.instagram_url := normalize_url(NEW.instagram_url);
        NEW.facebook_url := normalize_url(NEW.facebook_url);
        NEW.twitter_url := normalize_url(NEW.twitter_url);
    END IF;
    
    -- Normalizar URLs en tablas de negocios
    IF TG_TABLE_NAME IN ('clubs', 'tiendas', 'academias', 'instalaciones') THEN
        NEW.website := normalize_url(NEW.website);
        NEW.instagram_url := normalize_url(NEW.instagram_url);
        NEW.facebook_url := normalize_url(NEW.facebook_url);
        NEW.twitter_url := normalize_url(NEW.twitter_url);
        NEW.linkedin_url := normalize_url(NEW.linkedin_url);
        
        -- Para clubs también normalizar reservation_web
        IF TG_TABLE_NAME = 'clubs' THEN
            NEW.reservation_web := normalize_url(NEW.reservation_web);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para todas las tablas
DROP TRIGGER IF EXISTS normalize_urls_players ON players;
CREATE TRIGGER normalize_urls_players
    BEFORE INSERT OR UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION normalize_urls_trigger();

DROP TRIGGER IF EXISTS normalize_urls_clubs ON clubs;
CREATE TRIGGER normalize_urls_clubs
    BEFORE INSERT OR UPDATE ON clubs
    FOR EACH ROW
    EXECUTE FUNCTION normalize_urls_trigger();

DROP TRIGGER IF EXISTS normalize_urls_tiendas ON tiendas;
CREATE TRIGGER normalize_urls_tiendas
    BEFORE INSERT OR UPDATE ON tiendas
    FOR EACH ROW
    EXECUTE FUNCTION normalize_urls_trigger();

DROP TRIGGER IF EXISTS normalize_urls_academias ON academias;
CREATE TRIGGER normalize_urls_academias
    BEFORE INSERT OR UPDATE ON academias
    FOR EACH ROW
    EXECUTE FUNCTION normalize_urls_trigger();

DROP TRIGGER IF EXISTS normalize_urls_instalaciones ON instalaciones;
CREATE TRIGGER normalize_urls_instalaciones
    BEFORE INSERT OR UPDATE ON instalaciones
    FOR EACH ROW
    EXECUTE FUNCTION normalize_urls_trigger();

-- ===============================================
-- 11. ÍNDICES PARA REDES SOCIALES
-- ===============================================

-- Índices para players
CREATE INDEX IF NOT EXISTS idx_players_instagram ON players(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_facebook ON players(facebook_url) WHERE facebook_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_twitter ON players(twitter_url) WHERE twitter_url IS NOT NULL;

-- Índices para clubs
CREATE INDEX IF NOT EXISTS idx_clubs_instagram ON clubs(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clubs_facebook ON clubs(facebook_url) WHERE facebook_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clubs_twitter ON clubs(twitter_url) WHERE twitter_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clubs_linkedin ON clubs(linkedin_url) WHERE linkedin_url IS NOT NULL;

-- Índices para tiendas
CREATE INDEX IF NOT EXISTS idx_tiendas_instagram ON tiendas(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tiendas_facebook ON tiendas(facebook_url) WHERE facebook_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tiendas_twitter ON tiendas(twitter_url) WHERE twitter_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tiendas_linkedin ON tiendas(linkedin_url) WHERE linkedin_url IS NOT NULL;

-- Índices para academias
CREATE INDEX IF NOT EXISTS idx_academias_instagram ON academias(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academias_facebook ON academias(facebook_url) WHERE facebook_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academias_twitter ON academias(twitter_url) WHERE twitter_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_academias_linkedin ON academias(linkedin_url) WHERE linkedin_url IS NOT NULL;

-- Índices para instalaciones
CREATE INDEX IF NOT EXISTS idx_instalaciones_instagram ON instalaciones(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instalaciones_facebook ON instalaciones(facebook_url) WHERE facebook_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instalaciones_twitter ON instalaciones(twitter_url) WHERE twitter_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_instalaciones_linkedin ON instalaciones(linkedin_url) WHERE linkedin_url IS NOT NULL;

-- ===============================================
-- 12. FUNCIÓN DE VERIFICACIÓN
-- ===============================================

CREATE OR REPLACE FUNCTION verify_social_media_setup()
RETURNS TABLE(
    tabla TEXT,
    columnas_agregadas INTEGER,
    validaciones_aplicadas INTEGER,
    indices_creados INTEGER,
    status TEXT
) AS $$
DECLARE
    tabla_record RECORD;
    count_columnas INTEGER;
    count_validaciones INTEGER;
    count_indices INTEGER;
BEGIN
    -- Verificar cada tabla
    FOR tabla_record IN 
        SELECT unnest(ARRAY['players', 'clubs', 'tiendas', 'academias', 'instalaciones']) as tabla_name
    LOOP
        -- Contar columnas de redes sociales
        SELECT COUNT(*) INTO count_columnas
        FROM information_schema.columns 
        WHERE table_name = tabla_record.tabla_name
        AND column_name IN ('instagram_url', 'facebook_url', 'twitter_url', 'linkedin_url');
        
        -- Contar validaciones (constraints)
        SELECT COUNT(*) INTO count_validaciones
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = tabla_record.tabla_name
        AND tc.constraint_name LIKE '%valid_%url%';
        
        -- Contar índices de redes sociales
        SELECT COUNT(*) INTO count_indices
        FROM pg_indexes 
        WHERE tablename = tabla_record.tabla_name
        AND indexname LIKE '%_instagram' OR indexname LIKE '%_facebook' 
        OR indexname LIKE '%_twitter' OR indexname LIKE '%_linkedin';
        
        RETURN QUERY SELECT 
            tabla_record.tabla_name,
            count_columnas,
            count_validaciones,
            count_indices,
            CASE 
                WHEN count_columnas >= 3 THEN 'OK'
                ELSE 'ERROR'
            END;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 13. EJECUTAR VERIFICACIÓN
-- ===============================================

DO $$
DECLARE
    resultado RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE REDES SOCIALES ===';
    
    FOR resultado IN SELECT * FROM verify_social_media_setup() LOOP
        RAISE NOTICE 'Tabla: % | Columnas: % | Validaciones: % | Índices: % | Status: %', 
            resultado.tabla,
            resultado.columnas_agregadas,
            resultado.validaciones_aplicadas,
            resultado.indices_creados,
            resultado.status;
    END LOOP;
    
    RAISE NOTICE '=== FUNCIONES CREADAS ===';
    RAISE NOTICE '- normalize_url(): Normaliza URLs agregando https:// cuando necesario';
    RAISE NOTICE '- is_valid_url(): Valida URLs de forma permisiva';
    RAISE NOTICE '- normalize_urls_trigger(): Trigger automático para normalización';
    RAISE NOTICE '- verify_social_media_setup(): Verificación del setup completo';
    
    RAISE NOTICE '=== REDES SOCIALES AGREGADAS ===';
    RAISE NOTICE '- JUGADORES: Instagram, Facebook, Twitter';  
    RAISE NOTICE '- NEGOCIOS: Instagram, Facebook, Twitter, LinkedIn';
    
    RAISE NOTICE '=== URLS AHORA PERMITEN ===';
    RAISE NOTICE '- ejemplo.com (se convierte a https://ejemplo.com)';
    RAISE NOTICE '- www.ejemplo.com (se convierte a https://www.ejemplo.com)';
    RAISE NOTICE '- https://ejemplo.com (se mantiene igual)';
    RAISE NOTICE '- instagram.com/usuario (se convierte a https://instagram.com/usuario)';
    
    RAISE NOTICE '=== SETUP DE REDES SOCIALES COMPLETADO ===';
END $$; 