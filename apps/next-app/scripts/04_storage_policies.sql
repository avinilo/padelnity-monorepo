-- ===============================================
-- SCRIPT 04: POLÍTICAS DE STORAGE
-- ===============================================
-- Este script configura las políticas de Storage de Supabase
-- para permitir que los usuarios suban, actualicen y eliminen 
-- sus propias imágenes (avatars y banners)
-- 
-- EJECUTAR DESPUÉS DE: 03_rls_policies.sql
-- ===============================================

-- ===============================================
-- 1. VERIFICAR QUE LOS BUCKETS EXISTEN
-- ===============================================

-- Verificar existencia de buckets (creados en 01_initial_setup.sql)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        RAISE EXCEPTION 'Bucket "avatars" no existe. Ejecuta primero 01_initial_setup.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'banners') THEN
        RAISE EXCEPTION 'Bucket "banners" no existe. Ejecuta primero 01_initial_setup.sql';
    END IF;
    
    RAISE NOTICE 'Buckets verificados correctamente';
END $$;

-- ===============================================
-- 2. HABILITAR RLS EN STORAGE.OBJECTS (SI NO ESTÁ)
-- ===============================================

-- Esto puede fallar si ya está habilitado, pero es seguro intentarlo
DO $$
BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado en storage.objects';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'RLS ya estaba habilitado en storage.objects o no se pudo habilitar: %', SQLERRM;
END $$;

-- ===============================================
-- 3. LIMPIAR POLÍTICAS EXISTENTES (SEGURO)
-- ===============================================

-- Función para eliminar política si existe
DO $$
DECLARE
    policy_name TEXT;
    policy_names TEXT[] := ARRAY[
        'Avatar images are publicly accessible',
        'Users can upload their own avatar', 
        'Users can update their own avatar',
        'Users can delete their own avatar',
        'avatars_public_access',
        'avatars_user_upload',
        'avatars_user_update',
        'avatars_user_delete',
        'Banner images are publicly accessible',
        'Users can upload their own banner',
        'Users can update their own banner', 
        'Users can delete their own banner',
        'banners_public_access',
        'banners_user_upload',
        'banners_user_update',
        'banners_user_delete'
    ];
BEGIN
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
        EXCEPTION
            WHEN others THEN
                -- Ignorar errores al eliminar políticas que no existen
                NULL;
        END;
    END LOOP;
    RAISE NOTICE 'Políticas de storage limpiadas';
END $$;

-- ===============================================
-- 4. CREAR POLÍTICAS PARA AVATARS CON MANEJO DE ERRORES
-- ===============================================

-- Permitir acceso público para visualizar avatars
DO $$
BEGIN
    CREATE POLICY "avatars_public_access" ON storage.objects
        FOR SELECT 
        USING (bucket_id = 'avatars');
    RAISE NOTICE 'Política avatars_public_access creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política avatars_public_access ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear avatars_public_access. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando avatars_public_access: %', SQLERRM;
END $$;

-- Permitir a usuarios autenticados subir su propio avatar
DO $$
BEGIN
    CREATE POLICY "avatars_user_upload" ON storage.objects
        FOR INSERT 
        TO authenticated
        WITH CHECK (
            bucket_id = 'avatars' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    RAISE NOTICE 'Política avatars_user_upload creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política avatars_user_upload ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear avatars_user_upload. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando avatars_user_upload: %', SQLERRM;
END $$;

-- Permitir a usuarios actualizar su propio avatar
DO $$
BEGIN
    CREATE POLICY "avatars_user_update" ON storage.objects
        FOR UPDATE 
        TO authenticated
        USING (
            bucket_id = 'avatars' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'avatars' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    RAISE NOTICE 'Política avatars_user_update creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política avatars_user_update ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear avatars_user_update. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando avatars_user_update: %', SQLERRM;
END $$;

-- Permitir a usuarios eliminar su propio avatar
DO $$
BEGIN
    CREATE POLICY "avatars_user_delete" ON storage.objects
        FOR DELETE 
        TO authenticated
        USING (
            bucket_id = 'avatars' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    RAISE NOTICE 'Política avatars_user_delete creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política avatars_user_delete ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear avatars_user_delete. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando avatars_user_delete: %', SQLERRM;
END $$;

-- ===============================================
-- 5. CREAR POLÍTICAS PARA BANNERS CON MANEJO DE ERRORES
-- ===============================================

-- Permitir acceso público para visualizar banners
DO $$
BEGIN
    CREATE POLICY "banners_public_access" ON storage.objects
        FOR SELECT 
        USING (bucket_id = 'banners');
    RAISE NOTICE 'Política banners_public_access creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política banners_public_access ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear banners_public_access. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando banners_public_access: %', SQLERRM;
END $$;

-- Permitir a usuarios autenticados subir su propio banner
DO $$
BEGIN
    CREATE POLICY "banners_user_upload" ON storage.objects
        FOR INSERT 
        TO authenticated
        WITH CHECK (
            bucket_id = 'banners' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    RAISE NOTICE 'Política banners_user_upload creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política banners_user_upload ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear banners_user_upload. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando banners_user_upload: %', SQLERRM;
END $$;

-- Permitir a usuarios actualizar su propio banner
DO $$
BEGIN
    CREATE POLICY "banners_user_update" ON storage.objects
        FOR UPDATE 
        TO authenticated
        USING (
            bucket_id = 'banners' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'banners' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    RAISE NOTICE 'Política banners_user_update creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política banners_user_update ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear banners_user_update. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando banners_user_update: %', SQLERRM;
END $$;

-- Permitir a usuarios eliminar su propio banner
DO $$
BEGIN
    CREATE POLICY "banners_user_delete" ON storage.objects
        FOR DELETE 
        TO authenticated
        USING (
            bucket_id = 'banners' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    RAISE NOTICE 'Política banners_user_delete creada';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Política banners_user_delete ya existe';
    WHEN insufficient_privilege THEN
        RAISE WARNING 'Sin permisos para crear banners_user_delete. Usa el panel de Supabase.';
    WHEN others THEN
        RAISE WARNING 'Error creando banners_user_delete: %', SQLERRM;
END $$;

-- ===============================================
-- 6. VERIFICACIÓN DE CONFIGURACIÓN
-- ===============================================

-- Verificar que los buckets están configurados correctamente
SELECT 
    'Buckets configurados:' as info,
    json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'public', public,
            'file_size_limit', file_size_limit,
            'allowed_mime_types', allowed_mime_types
        )
    ) as buckets_info
FROM storage.buckets 
WHERE id IN ('avatars', 'banners');

-- Verificar políticas creadas (puede fallar si no tienes permisos para ver políticas)
DO $$
BEGIN
    PERFORM 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND (policyname LIKE '%avatar%' OR policyname LIKE '%banner%');
    
    IF FOUND THEN
        RAISE NOTICE 'Políticas de storage verificadas correctamente';
    ELSE
        RAISE NOTICE 'No se pudieron verificar las políticas de storage';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'No se puede verificar políticas de storage: %', SQLERRM;
END $$;

-- ===============================================
-- 7. MENSAJE FINAL
-- ===============================================

SELECT 'Storage configurado correctamente' as status,
       'Si hubo errores de permisos, crear políticas manualmente en el panel de Supabase' as note;

-- ===============================================
-- INSTRUCCIONES SI HAY ERRORES DE PERMISOS:
-- ===============================================
-- 
-- Si aparecen errores de permisos, ve al panel de Supabase:
-- 1. Storage → Settings → Policies
-- 2. Create policy on objects table
-- 3. Copia estas políticas manualmente:
--
-- AVATARS - SELECT (público):
-- bucket_id = 'avatars'
--
-- AVATARS - INSERT (autenticados):
-- bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- AVATARS - UPDATE (autenticados):
-- bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- AVATARS - DELETE (autenticados):  
-- bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- (Repetir lo mismo para BANNERS cambiando 'avatars' por 'banners')
-- ===============================================

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 05_functions_views.sql
-- =============================================== 