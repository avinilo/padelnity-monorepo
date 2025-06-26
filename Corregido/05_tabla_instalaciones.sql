-- =============================================
-- TABLA INSTALACIONES - PADELNITY
-- =============================================
-- Tabla para instalaciones deportivas con enfoque en padel
-- Incluye todos los campos específicos del formulario
-- Con validaciones, índices, políticas RLS, funciones y vistas

-- Primero, asegurar que las extensiones necesarias estén habilitadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Crear la tabla instalaciones
CREATE TABLE IF NOT EXISTS public.instalaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información básica
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Horarios de funcionamiento
    horario_apertura TIME NOT NULL, -- Formato HH:MM
    horario_cierre TIME NOT NULL,   -- Formato HH:MM
    
    -- Años de experiencia
    years_experience VARCHAR(10) CHECK (years_experience IN ('0-1', '1-3', '3-5', '5-10', '10-15', '15+')),
    
    -- INFORMACIÓN ESPECÍFICA DE PADEL (OBLIGATORIA)
    number_of_padel_courts INTEGER NOT NULL CHECK (number_of_padel_courts >= 1 AND number_of_padel_courts <= 50),
    
    -- Tipos de pistas de padel (array JSONB)
    padel_court_types JSONB DEFAULT '[]' CHECK (jsonb_typeof(padel_court_types) = 'array'),
    
    -- Servicios de padel (array JSONB) - AL MENOS UNO OBLIGATORIO
    padel_services JSONB NOT NULL DEFAULT '[]' CHECK (
        jsonb_typeof(padel_services) = 'array' AND
        jsonb_array_length(padel_services) > 0
    ),
    
    -- Otros deportes y actividades (array JSONB)
    other_sports JSONB DEFAULT '[]' CHECK (jsonb_typeof(other_sports) = 'array'),
    
    -- Instalaciones adicionales (array JSONB)
    additional_facilities JSONB DEFAULT '[]' CHECK (jsonb_typeof(additional_facilities) = 'array'),
    
    -- Idiomas de atención (array JSONB)
    languages JSONB NOT NULL DEFAULT '[]' CHECK (
        jsonb_typeof(languages) = 'array' AND
        jsonb_array_length(languages) > 0
    ),
    
    -- Imágenes
    avatar_url TEXT,
    banner_url TEXT,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Validaciones adicionales
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://.*'),
    CONSTRAINT valid_phone CHECK (phone ~ '^[\+]?[0-9\s\-\(\)]{7,20}$'),
    CONSTRAINT valid_horarios CHECK (horario_apertura != horario_cierre),
    CONSTRAINT valid_languages_content CHECK (
        jsonb_path_exists(languages, '$[*] ? (@ == "espanol" || @ == "ingles" || @ == "frances" || @ == "aleman" || @ == "italiano" || @ == "portugues")')
    ),
    CONSTRAINT valid_padel_court_types_content CHECK (
        padel_court_types = '[]'::jsonb OR
        jsonb_path_exists(padel_court_types, '$[*] ? (
            @ == "cristal" || @ == "malla" || @ == "mixtas" || @ == "panoramicas" || @ == "cubiertas" || @ == "exteriores"
        )')
    ),
    CONSTRAINT valid_padel_services_content CHECK (
        jsonb_path_exists(padel_services, '$[*] ? (
            @ == "alquiler-pistas-padel" || @ == "clases-padel" || @ == "torneos-padel" || @ == "ligas-padel" ||
            @ == "alquiler-material-padel" || @ == "tienda-padel" || @ == "eventos-corporativos-padel" || @ == "campus-padel"
        )')
    ),
    CONSTRAINT valid_other_sports_content CHECK (
        other_sports = '[]'::jsonb OR
        jsonb_path_exists(other_sports, '$[*] ? (
            @ == "tenis" || @ == "futbol-sala" || @ == "basquet" || @ == "voleibol" || @ == "squash" || 
            @ == "badminton" || @ == "multideporte" || @ == "natacion" || @ == "fitness"
        )')
    ),
    CONSTRAINT valid_additional_facilities_content CHECK (
        additional_facilities = '[]'::jsonb OR
        jsonb_path_exists(additional_facilities, '$[*] ? (
            @ == "vestuarios-padel" || @ == "duchas" || @ == "cafeteria" || @ == "restaurante" || 
            @ == "tienda-deportiva" || @ == "gimnasio" || @ == "spa" || @ == "sauna" || @ == "piscina" || 
            @ == "parking" || @ == "wifi" || @ == "aire-acondicionado" || @ == "acceso-silla-ruedas" || 
            @ == "zona-infantil" || @ == "sala-eventos"
        )')
    )
);

-- Comentarios en la tabla
COMMENT ON TABLE public.instalaciones IS 'Tabla para instalaciones deportivas con enfoque en padel';
COMMENT ON COLUMN public.instalaciones.business_name IS 'Nombre de la instalación deportiva';
COMMENT ON COLUMN public.instalaciones.contact_name IS 'Nombre del responsable de la instalación';
COMMENT ON COLUMN public.instalaciones.number_of_padel_courts IS 'Número de pistas de padel (obligatorio, mínimo 1)';
COMMENT ON COLUMN public.instalaciones.padel_court_types IS 'Tipos de pistas de padel disponibles';
COMMENT ON COLUMN public.instalaciones.padel_services IS 'Servicios de padel ofrecidos (obligatorio al menos uno)';
COMMENT ON COLUMN public.instalaciones.other_sports IS 'Otros deportes y actividades disponibles';
COMMENT ON COLUMN public.instalaciones.additional_facilities IS 'Instalaciones y facilidades adicionales';
COMMENT ON COLUMN public.instalaciones.languages IS 'Idiomas de atención al cliente';

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_instalaciones_user_id ON public.instalaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_instalaciones_business_name ON public.instalaciones USING gin(business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_instalaciones_address ON public.instalaciones USING gin(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_instalaciones_number_padel_courts ON public.instalaciones(number_of_padel_courts);
CREATE INDEX IF NOT EXISTS idx_instalaciones_padel_court_types ON public.instalaciones USING gin(padel_court_types);
CREATE INDEX IF NOT EXISTS idx_instalaciones_padel_services ON public.instalaciones USING gin(padel_services);
CREATE INDEX IF NOT EXISTS idx_instalaciones_other_sports ON public.instalaciones USING gin(other_sports);
CREATE INDEX IF NOT EXISTS idx_instalaciones_additional_facilities ON public.instalaciones USING gin(additional_facilities);
CREATE INDEX IF NOT EXISTS idx_instalaciones_languages ON public.instalaciones USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_instalaciones_years_experience ON public.instalaciones(years_experience);
CREATE INDEX IF NOT EXISTS idx_instalaciones_is_active ON public.instalaciones(is_active);
CREATE INDEX IF NOT EXISTS idx_instalaciones_created_at ON public.instalaciones(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instalaciones_updated_at
    BEFORE UPDATE ON public.instalaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

-- Habilitar RLS en la tabla
ALTER TABLE public.instalaciones ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver todas las instalaciones activas
CREATE POLICY "Las instalaciones activas son visibles para todos" ON public.instalaciones
    FOR SELECT USING (is_active = true);

-- Política para que los usuarios puedan ver sus propias instalaciones
CREATE POLICY "Los usuarios pueden ver sus propias instalaciones" ON public.instalaciones
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan crear sus propias instalaciones
CREATE POLICY "Los usuarios pueden crear instalaciones" ON public.instalaciones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias instalaciones
CREATE POLICY "Los usuarios pueden actualizar sus propias instalaciones" ON public.instalaciones
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias instalaciones
CREATE POLICY "Los usuarios pueden eliminar sus propias instalaciones" ON public.instalaciones
    FOR DELETE USING (auth.uid() = user_id);

-- Política para acceso de usuarios anónimos (solo lectura de instalaciones activas)
CREATE POLICY "Acceso anónimo a instalaciones activas" ON public.instalaciones
    FOR SELECT USING (is_active = true AND auth.uid() IS NULL);

-- =============================================
-- FUNCIONES DE UTILIDAD
-- =============================================

-- Función para buscar instalaciones por servicios de padel
CREATE OR REPLACE FUNCTION buscar_instalaciones_por_servicios_padel(servicios_buscados TEXT[])
RETURNS SETOF public.instalaciones AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.instalaciones
    WHERE is_active = true
    AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(padel_services) AS servicio
        WHERE servicio = ANY(servicios_buscados)
    )
    ORDER BY business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar instalaciones por número de pistas
CREATE OR REPLACE FUNCTION buscar_instalaciones_por_pistas(min_courts INTEGER, max_courts INTEGER DEFAULT NULL)
RETURNS SETOF public.instalaciones AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.instalaciones
    WHERE is_active = true
    AND number_of_padel_courts >= min_courts
    AND (max_courts IS NULL OR number_of_padel_courts <= max_courts)
    ORDER BY number_of_padel_courts DESC, business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar instalaciones por tipo de pista
CREATE OR REPLACE FUNCTION buscar_instalaciones_por_tipo_pista(tipo_pista TEXT)
RETURNS SETOF public.instalaciones AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.instalaciones
    WHERE is_active = true
    AND padel_court_types ? tipo_pista
    ORDER BY business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar instalaciones multideporte
CREATE OR REPLACE FUNCTION buscar_instalaciones_multideporte()
RETURNS SETOF public.instalaciones AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.instalaciones
    WHERE is_active = true
    AND jsonb_array_length(other_sports) > 0
    ORDER BY jsonb_array_length(other_sports) DESC, business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar instalaciones por ubicación
CREATE OR REPLACE FUNCTION buscar_instalaciones_por_ubicacion(termino_busqueda TEXT)
RETURNS SETOF public.instalaciones AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.instalaciones
    WHERE is_active = true
    AND (
        unaccent(LOWER(address)) LIKE unaccent(LOWER('%' || termino_busqueda || '%')) OR
        unaccent(LOWER(business_name)) LIKE unaccent(LOWER('%' || termino_busqueda || '%'))
    )
    ORDER BY 
        CASE 
            WHEN unaccent(LOWER(business_name)) LIKE unaccent(LOWER('%' || termino_busqueda || '%')) THEN 1
            ELSE 2
        END,
        business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de instalaciones
CREATE OR REPLACE FUNCTION estadisticas_instalaciones()
RETURNS TABLE(
    total_instalaciones BIGINT,
    total_pistas_padel NUMERIC,
    promedio_pistas_por_instalacion NUMERIC,
    instalacion_mas_grande TEXT,
    max_pistas INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_instalaciones,
        SUM(number_of_padel_courts) as total_pistas_padel,
        AVG(number_of_padel_courts) as promedio_pistas_por_instalacion,
        (SELECT business_name FROM public.instalaciones WHERE is_active = true ORDER BY number_of_padel_courts DESC LIMIT 1) as instalacion_mas_grande,
        (SELECT MAX(number_of_padel_courts) FROM public.instalaciones WHERE is_active = true) as max_pistas
    FROM public.instalaciones
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de servicios más ofrecidos
CREATE OR REPLACE FUNCTION estadisticas_servicios_padel()
RETURNS TABLE(servicio TEXT, cantidad BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        servicio_item AS servicio,
        COUNT(*) AS cantidad
    FROM public.instalaciones,
         jsonb_array_elements_text(padel_services) AS servicio_item
    WHERE is_active = true
    GROUP BY servicio_item
    ORDER BY cantidad DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de deportes adicionales
CREATE OR REPLACE FUNCTION estadisticas_otros_deportes()
RETURNS TABLE(deporte TEXT, cantidad BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        deporte_item AS deporte,
        COUNT(*) AS cantidad
    FROM public.instalaciones,
         jsonb_array_elements_text(other_sports) AS deporte_item
    WHERE is_active = true
    GROUP BY deporte_item
    ORDER BY cantidad DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista con información resumida de instalaciones
CREATE OR REPLACE VIEW public.vista_instalaciones_resumen AS
SELECT 
    id,
    business_name,
    contact_name,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    years_experience,
    number_of_padel_courts,
    jsonb_array_length(padel_services) as total_servicios_padel,
    jsonb_array_length(other_sports) as total_otros_deportes,
    jsonb_array_length(additional_facilities) as total_instalaciones_adicionales,
    avatar_url,
    created_at,
    is_active
FROM public.instalaciones
WHERE is_active = true
ORDER BY number_of_padel_courts DESC, business_name;

-- Vista para instalaciones grandes (6+ pistas)
CREATE OR REPLACE VIEW public.vista_instalaciones_grandes AS
SELECT 
    i.*,
    'Grande' as categoria_tamaño
FROM public.instalaciones i
WHERE i.is_active = true
AND i.number_of_padel_courts >= 6
ORDER BY i.number_of_padel_courts DESC, i.business_name;

-- Vista para instalaciones con servicios premium
CREATE OR REPLACE VIEW public.vista_instalaciones_premium AS
SELECT 
    i.*,
    CASE WHEN i.padel_services ? 'eventos-corporativos-padel' THEN true ELSE false END as eventos_corporativos,
    CASE WHEN i.padel_services ? 'campus-padel' THEN true ELSE false END as campus_padel,
    CASE WHEN i.additional_facilities ? 'spa' THEN true ELSE false END as tiene_spa,
    CASE WHEN i.additional_facilities ? 'restaurante' THEN true ELSE false END as tiene_restaurante
FROM public.instalaciones i
WHERE i.is_active = true
AND (
    i.padel_services ? 'eventos-corporativos-padel' OR
    i.padel_services ? 'campus-padel' OR
    i.additional_facilities ? 'spa' OR
    i.additional_facilities ? 'restaurante'
)
ORDER BY i.business_name;

-- Vista para instalaciones multideporte
CREATE OR REPLACE VIEW public.vista_instalaciones_multideporte AS
SELECT 
    i.*,
    jsonb_array_length(i.other_sports) as cantidad_deportes_extra,
    CASE WHEN i.other_sports ? 'tenis' THEN true ELSE false END as tiene_tenis,
    CASE WHEN i.other_sports ? 'natacion' THEN true ELSE false END as tiene_piscina,
    CASE WHEN i.other_sports ? 'fitness' THEN true ELSE false END as tiene_gimnasio
FROM public.instalaciones i
WHERE i.is_active = true
AND jsonb_array_length(i.other_sports) > 0
ORDER BY jsonb_array_length(i.other_sports) DESC, i.business_name;

-- Vista para instalaciones con clases de padel
CREATE OR REPLACE VIEW public.vista_instalaciones_con_clases AS
SELECT i.*
FROM public.instalaciones i
WHERE i.is_active = true
AND i.padel_services ? 'clases-padel'
ORDER BY i.number_of_padel_courts DESC, i.business_name;

-- =============================================
-- FUNCIONES DE VERIFICACIÓN
-- =============================================

-- Verificar que la tabla se creó correctamente
DO $$
BEGIN
    -- Verificar que la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'instalaciones' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Error: La tabla instalaciones no se creó correctamente';
    END IF;
    
    -- Verificar que los índices se crearon
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'instalaciones' AND indexname = 'idx_instalaciones_user_id') THEN
        RAISE EXCEPTION 'Error: Los índices de instalaciones no se crearon correctamente';
    END IF;
    
    -- Verificar que las políticas RLS están habilitadas
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'instalaciones' AND rowsecurity = true) THEN
        RAISE EXCEPTION 'Error: RLS no está habilitado en la tabla instalaciones';
    END IF;
    
    RAISE NOTICE 'Tabla instalaciones creada exitosamente con todas sus funcionalidades';
END
$$;

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Comentar/descomentar según necesidad
/*
INSERT INTO public.instalaciones (
    user_id,
    business_name,
    contact_name,
    description,
    address,
    phone,
    email,
    website,
    horario_apertura,
    horario_cierre,
    years_experience,
    number_of_padel_courts,
    padel_court_types,
    padel_services,
    other_sports,
    additional_facilities,
    languages
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Cambiar por un UUID real
    'Centro Deportivo Malasaña',
    'Ana Martínez',
    'Centro deportivo completo con excelentes instalaciones de padel y otros deportes',
    'Calle Malasaña 45, Madrid',
    '+34 91 555 1234',
    'info@centromalasana.com',
    'https://www.centromalasana.com',
    '07:00',
    '23:00',
    '10-15',
    8,
    '["cristal", "cubiertas", "exteriores"]',
    '["alquiler-pistas-padel", "clases-padel", "torneos-padel", "ligas-padel", "tienda-padel"]',
    '["tenis", "natacion", "fitness"]',
    '["vestuarios-padel", "duchas", "cafeteria", "restaurante", "gimnasio", "piscina", "parking", "wifi"]',
    '["espanol", "ingles"]'
);
*/

-- =============================================
-- RESUMEN FINAL
-- =============================================

SELECT 'Tabla INSTALACIONES creada exitosamente' as resultado,
       'Incluye: estructura completa, validaciones, índices, RLS, funciones especializadas, vistas útiles para padel' as detalles; 