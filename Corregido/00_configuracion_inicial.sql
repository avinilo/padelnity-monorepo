-- ===============================================
-- SCRIPT 00: CONFIGURACIÓN INICIAL PADELNITY
-- ===============================================
-- Este script configura las extensiones necesarias y los buckets
-- de almacenamiento para la aplicación Padelnity (ESQUEMA REESTRUCTURADO)
-- 
-- EJECUTAR PRIMERO: Este debe ser el primer script en ejecutarse
-- Versión: 2.0 - Esquema con 5 tablas especializadas
-- ===============================================

-- ===============================================
-- 1. EXTENSIONES NECESARIAS
-- ===============================================

-- Habilitar extensiones requeridas para el nuevo esquema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Para búsquedas de texto completo
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- Para búsquedas sin acentos

-- ===============================================
-- 2. STORAGE BUCKETS PARA IMÁGENES
-- ===============================================

-- Crear buckets para almacenar imágenes de usuarios y negocios
-- Configurados para las 5 tablas especializadas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 3. CONFIGURACIÓN ADICIONAL
-- ===============================================

-- Configurar timezone por defecto (opcional)
-- ALTER DATABASE postgres SET timezone TO 'UTC';

-- ===============================================
-- CONFIRMACIÓN Y VERIFICACIÓN
-- ===============================================

-- Verificar que las extensiones están disponibles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent')
        HAVING COUNT(*) = 4
    ) THEN
        RAISE EXCEPTION 'Error: No se pudieron instalar todas las extensiones necesarias';
    END IF;
    
    RAISE NOTICE 'Extensiones instaladas correctamente: uuid-ossp, pgcrypto, pg_trgm, unaccent';
END $$;

-- Verificar que los buckets se crearon
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id IN ('avatars', 'banners')
        HAVING COUNT(*) = 2
    ) THEN
        RAISE EXCEPTION 'Error: No se pudieron crear los buckets de storage';
    END IF;
    
    RAISE NOTICE 'Buckets de storage creados correctamente: avatars, banners';
END $$;

-- ===============================================
-- RESUMEN DE CONFIGURACIÓN
-- ===============================================

SELECT 
    'Configuración inicial completada' as status,
    'Extensiones: uuid-ossp, pgcrypto, pg_trgm, unaccent' as extensiones,
    'Buckets: avatars (5MB), banners (10MB)' as storage,
    'Listo para ejecutar: 01_tabla_players.sql' as siguiente_paso;

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 01_tabla_players.sql
-- =============================================== 