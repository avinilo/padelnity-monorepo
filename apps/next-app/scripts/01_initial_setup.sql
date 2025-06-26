-- ===============================================
-- SCRIPT 01: CONFIGURACIÓN INICIAL PADELNITY
-- ===============================================
-- Este script configura las extensiones necesarias y los buckets
-- de almacenamiento para la aplicación Padelnity
-- 
-- EJECUTAR PRIMERO: Este debe ser el primer script en ejecutarse
-- ===============================================

-- ===============================================
-- 1. EXTENSIONES NECESARIAS
-- ===============================================

-- Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 2. STORAGE BUCKETS PARA IMÁGENES
-- ===============================================

-- Crear buckets para almacenar imágenes de usuarios y negocios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- CONFIRMACIÓN
-- ===============================================

-- Verificar que las extensiones están disponibles
SELECT 'Extensiones instaladas correctamente' AS status
WHERE EXISTS (
  SELECT 1 FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')
  HAVING COUNT(*) = 2
);

-- Verificar que los buckets se crearon
SELECT 'Buckets de storage creados correctamente' AS status
WHERE EXISTS (
  SELECT 1 FROM storage.buckets WHERE id IN ('avatars', 'banners')
  HAVING COUNT(*) = 2
);

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 02_tables.sql
-- =============================================== 