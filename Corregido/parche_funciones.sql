-- ===============================================
-- PARCHE: ELIMINAR FUNCIONES CONFLICTIVAS
-- ===============================================
-- Ejecutar ANTES de correr los scripts principales
-- para evitar errores de tipo "cannot change return type"
-- ===============================================

-- Funciones de players (script 01)
DROP FUNCTION IF EXISTS find_compatible_players(UUID, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS get_player_stats();

-- Funciones de clubs (script 02)
DROP FUNCTION IF EXISTS find_clubs_by_services(TEXT[], TEXT, INTEGER);
DROP FUNCTION IF EXISTS find_clubs_near_location(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_clubs_stats();

-- Funciones de tiendas (script 03)
DROP FUNCTION IF EXISTS find_tiendas_by_products(TEXT[], TEXT, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS find_tiendas_by_services(TEXT[], TEXT, INTEGER);
DROP FUNCTION IF EXISTS find_tiendas_near_location(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_tiendas_stats();

-- Funciones de academias (script 04)
DROP FUNCTION IF EXISTS find_academias_by_programs(TEXT[], TEXT, INTEGER);
DROP FUNCTION IF EXISTS find_academias_by_level_and_age(TEXT, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS find_academias_near_location(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_academias_stats();

-- Funciones de instalaciones (script 05)
DROP FUNCTION IF EXISTS find_instalaciones_by_services(TEXT[], TEXT, INTEGER);
DROP FUNCTION IF EXISTS find_instalaciones_by_court_type(TEXT[], TEXT, INTEGER);
DROP FUNCTION IF EXISTS find_instalaciones_near_location(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_instalaciones_stats();

-- Funciones globales (script 07)
DROP FUNCTION IF EXISTS search_all_businesses(TEXT, TEXT[], TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_system_stats();
DROP FUNCTION IF EXISTS get_user_complete_profile(UUID);
DROP FUNCTION IF EXISTS cleanup_inactive_data(INTEGER);
DROP FUNCTION IF EXISTS get_performance_metrics();

-- Funciones de verificación (script 08)
DROP FUNCTION IF EXISTS check_padelnity_complete_setup_v2();
DROP FUNCTION IF EXISTS test_data_insertion_v2();
DROP FUNCTION IF EXISTS get_setup_summary_v2();

SELECT 'Funciones conflictivas eliminadas correctamente' AS status; 