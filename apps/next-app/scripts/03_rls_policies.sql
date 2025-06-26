-- ===============================================
-- SCRIPT 03: POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ===============================================
-- Este script configura todas las políticas de seguridad a nivel de fila
-- para las tablas players y businesses de Padelnity
-- 
-- EJECUTAR DESPUÉS DE: 02_tables.sql
-- ===============================================

-- ===============================================
-- 1. ACTIVAR RLS EN TODAS LAS TABLAS
-- ===============================================

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 2. LIMPIAR POLÍTICAS EXISTENTES (SI EXISTEN)
-- ===============================================

-- Limpiar políticas de PLAYERS
DROP POLICY IF EXISTS "Users can create their own player profile" ON public.players;
DROP POLICY IF EXISTS "Users can read their own player profile" ON public.players;
DROP POLICY IF EXISTS "Users can update their own player profile" ON public.players;
DROP POLICY IF EXISTS "Users can delete their own player profile" ON public.players;
DROP POLICY IF EXISTS "authenticated_users_can_create_player_profile" ON public.players;
DROP POLICY IF EXISTS "users_can_read_own_player_profile" ON public.players;
DROP POLICY IF EXISTS "users_can_update_own_player_profile" ON public.players;
DROP POLICY IF EXISTS "Users can insert their own player profile" ON public.players;
DROP POLICY IF EXISTS "Users can view their own player profile" ON public.players;

-- Limpiar políticas de BUSINESSES  
DROP POLICY IF EXISTS "Users can create their own business profile" ON public.businesses;
DROP POLICY IF EXISTS "Users can read their own business profile" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their own business profile" ON public.businesses;
DROP POLICY IF EXISTS "Users can delete their own business profile" ON public.businesses;
DROP POLICY IF EXISTS "authenticated_users_can_create_business_profile" ON public.businesses;
DROP POLICY IF EXISTS "users_can_read_own_business_profile" ON public.businesses;
DROP POLICY IF EXISTS "users_can_update_own_business_profile" ON public.businesses;
DROP POLICY IF EXISTS "Users can insert their own business profile" ON public.businesses;
DROP POLICY IF EXISTS "Users can view their own business profile" ON public.businesses;

-- ===============================================
-- 3. CREAR POLÍTICAS PARA TABLA PLAYERS
-- ===============================================

-- Permitir INSERT: Solo usuarios autenticados pueden crear su propio perfil
CREATE POLICY "players_insert_own_profile" ON public.players
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT: Solo usuarios pueden ver su propio perfil
CREATE POLICY "players_select_own_profile" ON public.players
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Permitir UPDATE: Solo usuarios pueden actualizar su propio perfil
CREATE POLICY "players_update_own_profile" ON public.players
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE: Solo usuarios pueden eliminar su propio perfil
CREATE POLICY "players_delete_own_profile" ON public.players
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- ===============================================
-- 4. CREAR POLÍTICAS PARA TABLA BUSINESSES
-- ===============================================

-- Permitir INSERT: Solo usuarios autenticados pueden crear su propio perfil de negocio
CREATE POLICY "businesses_insert_own_profile" ON public.businesses
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT: Solo usuarios pueden ver su propio perfil de negocio
CREATE POLICY "businesses_select_own_profile" ON public.businesses
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Permitir UPDATE: Solo usuarios pueden actualizar su propio perfil de negocio
CREATE POLICY "businesses_update_own_profile" ON public.businesses
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Permitir DELETE: Solo usuarios pueden eliminar su propio perfil de negocio
CREATE POLICY "businesses_delete_own_profile" ON public.businesses
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- ===============================================
-- 5. POLÍTICAS ADICIONALES (OPCIONAL - COMENTADAS)
-- ===============================================

-- Si quieres que los perfiles verificados sean visibles públicamente:
-- CREATE POLICY "verified_businesses_public_view" ON public.businesses
--     FOR SELECT 
--     TO anon, authenticated
--     USING (verification_status = 'verified');

-- Si quieres permitir búsquedas públicas de jugadores:
-- CREATE POLICY "players_public_search" ON public.players
--     FOR SELECT 
--     TO anon, authenticated
--     USING (onboarding_complete = true);

-- ===============================================
-- 6. VERIFICACIÓN DE POLÍTICAS
-- ===============================================

-- Mostrar todas las políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('players', 'businesses')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('players', 'businesses')
  AND schemaname = 'public';

-- ===============================================
-- CONFIRMACIÓN
-- ===============================================

SELECT 'Políticas RLS configuradas correctamente' AS status
WHERE EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename IN ('players', 'businesses')
    AND schemaname = 'public'
    HAVING COUNT(*) >= 8  -- 4 políticas por tabla mínimo
);

-- ===============================================
-- SIGUIENTE PASO: Ejecutar 04_storage_policies.sql
-- =============================================== 