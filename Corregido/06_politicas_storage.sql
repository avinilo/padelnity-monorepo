-- ===============================================
-- SCRIPT 06: POLÍTICAS DE STORAGE
-- ===============================================
-- Este script configura las políticas de Storage de Supabase
-- para permitir que los usuarios suban, actualicen y eliminen 
-- sus propias imágenes (avatars y banners)
-- 
-- EJECUTAR DESPUÉS DE: 05_tabla_instalaciones.sql
-- Versión: 2.0 - Compatible con esquema de 5 tablas especializadas
-- ===============================================

-- ===============================================
-- 1. VERIFICAR QUE LOS BUCKETS EXISTEN
-- ===============================================

-- Verificar existencia de buckets (creados en 00_configuracion_inicial.sql)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        RAISE EXCEPTION 'Bucket "avatars" no existe. Ejecuta primero 00_configuracion_inicial.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'banners') THEN
        RAISE EXCEPTION 'Bucket "banners" no existe. Ejecuta primero 00_configuracion_inicial.sql';
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

-- Permitir a usuarios autenticados actualizar su propio banner
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
-- 6. VERIFICACIÓN FINAL
-- ===============================================

-- Verificar que todas las políticas se crearon correctamente
DO $$
DECLARE
    avatar_policies_count INTEGER;
    banner_policies_count INTEGER;
BEGIN
    -- Contar políticas de avatars
    SELECT COUNT(*) INTO avatar_policies_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE 'avatars_%';
    
    -- Contar políticas de banners
    SELECT COUNT(*) INTO banner_policies_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE 'banners_%';
    
    IF avatar_policies_count >= 4 AND banner_policies_count >= 4 THEN
        RAISE NOTICE 'Políticas de storage configuradas correctamente: % avatars, % banners', 
                     avatar_policies_count, banner_policies_count;
    ELSE
        RAISE WARNING 'Algunas políticas pueden no haberse creado correctamente. Avatars: %, Banners: %', 
                      avatar_policies_count, banner_policies_count;
    END IF;
END $$;

-- ===============================================
-- RESUMEN FINAL
-- ===============================================

SELECT 'Políticas de Storage configuradas' as resultado,
       'Avatars y banners con acceso público y gestión privada' as detalles,
       'Listo para ejecutar: 07_funciones_globales.sql' as siguiente_paso;

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 07_funciones_globales.sql
-- =============================================== 