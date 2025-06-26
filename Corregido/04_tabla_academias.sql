-- =============================================
-- TABLA ACADEMIAS - PADELNITY
-- =============================================
-- Tabla para academias/escuelas de padel
-- Incluye todos los campos específicos del formulario
-- Con validaciones, índices, políticas RLS, funciones y vistas

-- Primero, asegurar que las extensiones necesarias estén habilitadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Crear la tabla academias
CREATE TABLE IF NOT EXISTS public.academias (
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
    
    -- Información específica de la academia
    number_of_courts INTEGER CHECK (number_of_courts >= 1 AND number_of_courts <= 50),
    
    -- Idiomas de enseñanza (array JSONB)
    languages JSONB NOT NULL DEFAULT '[]' CHECK (
        jsonb_typeof(languages) = 'array' AND
        jsonb_array_length(languages) > 0
    ),
    
    -- Servicios educativos principales (array JSONB)
    main_services JSONB DEFAULT '[]' CHECK (jsonb_typeof(main_services) = 'array'),
    
    -- Instalaciones y facilidades adicionales (array JSONB)
    additional_facilities JSONB DEFAULT '[]' CHECK (jsonb_typeof(additional_facilities) = 'array'),
    
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
    CONSTRAINT valid_main_services_content CHECK (
        main_services = '[]'::jsonb OR
        jsonb_path_exists(main_services, '$[*] ? (
            @ == "clases-particulares" || @ == "clases-grupales" || @ == "clases-infantiles" || 
            @ == "clases-adultos" || @ == "entrenamientos-competicion" || @ == "clinics-especializados" ||
            @ == "torneos-internos" || @ == "campamentos-verano" || @ == "preparacion-fisica" || @ == "formacion-profesores"
        )')
    ),
    CONSTRAINT valid_additional_facilities_content CHECK (
        additional_facilities = '[]'::jsonb OR
        jsonb_path_exists(additional_facilities, '$[*] ? (
            @ == "vestuarios" || @ == "duchas" || @ == "cafeteria" || @ == "tienda-material" || 
            @ == "parking" || @ == "wifi" || @ == "aire-acondicionado" || @ == "sala-espera" || 
            @ == "zona-estiramiento" || @ == "acceso-silla-ruedas" || @ == "alquiler-material" || @ == "fisioterapeuta"
        )')
    )
);

-- Comentarios en la tabla
COMMENT ON TABLE public.academias IS 'Tabla para academias y escuelas de padel con servicios educativos';
COMMENT ON COLUMN public.academias.business_name IS 'Nombre de la academia';
COMMENT ON COLUMN public.academias.contact_name IS 'Nombre del responsable de la academia';
COMMENT ON COLUMN public.academias.years_experience IS 'Años de experiencia en enseñanza';
COMMENT ON COLUMN public.academias.number_of_courts IS 'Número de pistas disponibles';
COMMENT ON COLUMN public.academias.languages IS 'Idiomas en los que se puede enseñar';
COMMENT ON COLUMN public.academias.main_services IS 'Servicios educativos principales ofrecidos';
COMMENT ON COLUMN public.academias.additional_facilities IS 'Instalaciones y facilidades adicionales';

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_academias_user_id ON public.academias(user_id);
CREATE INDEX IF NOT EXISTS idx_academias_business_name ON public.academias USING gin(business_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_academias_address ON public.academias USING gin(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_academias_languages ON public.academias USING gin(languages);
CREATE INDEX IF NOT EXISTS idx_academias_main_services ON public.academias USING gin(main_services);
CREATE INDEX IF NOT EXISTS idx_academias_additional_facilities ON public.academias USING gin(additional_facilities);
CREATE INDEX IF NOT EXISTS idx_academias_years_experience ON public.academias(years_experience);
CREATE INDEX IF NOT EXISTS idx_academias_number_of_courts ON public.academias(number_of_courts);
CREATE INDEX IF NOT EXISTS idx_academias_is_active ON public.academias(is_active);
CREATE INDEX IF NOT EXISTS idx_academias_created_at ON public.academias(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_academias_updated_at
    BEFORE UPDATE ON public.academias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

-- Habilitar RLS en la tabla
ALTER TABLE public.academias ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver todas las academias activas (para búsquedas públicas)
CREATE POLICY "Las academias activas son visibles para todos" ON public.academias
    FOR SELECT USING (is_active = true);

-- Política para que los usuarios puedan ver sus propias academias (incluso inactivas)
CREATE POLICY "Los usuarios pueden ver sus propias academias" ON public.academias
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan crear sus propias academias
CREATE POLICY "Los usuarios pueden crear academias" ON public.academias
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias academias
CREATE POLICY "Los usuarios pueden actualizar sus propias academias" ON public.academias
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias academias
CREATE POLICY "Los usuarios pueden eliminar sus propias academias" ON public.academias
    FOR DELETE USING (auth.uid() = user_id);

-- Política para acceso de usuarios anónimos (solo lectura de academias activas)
CREATE POLICY "Acceso anónimo a academias activas" ON public.academias
    FOR SELECT USING (is_active = true AND auth.uid() IS NULL);

-- =============================================
-- FUNCIONES DE UTILIDAD
-- =============================================

-- Función para buscar academias por servicios educativos
CREATE OR REPLACE FUNCTION buscar_academias_por_servicios(servicios_buscados TEXT[])
RETURNS SETOF public.academias AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.academias
    WHERE is_active = true
    AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(main_services) AS servicio
        WHERE servicio = ANY(servicios_buscados)
    )
    ORDER BY business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar academias por idioma
CREATE OR REPLACE FUNCTION buscar_academias_por_idioma(idioma_buscado TEXT)
RETURNS SETOF public.academias AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.academias
    WHERE is_active = true
    AND languages ? idioma_buscado
    ORDER BY business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar academias por ubicación
CREATE OR REPLACE FUNCTION buscar_academias_por_ubicacion(termino_busqueda TEXT)
RETURNS SETOF public.academias AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.academias
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

-- Función para obtener estadísticas de servicios más ofrecidos
CREATE OR REPLACE FUNCTION estadisticas_servicios_academias()
RETURNS TABLE(servicio TEXT, cantidad BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        servicio_item AS servicio,
        COUNT(*) AS cantidad
    FROM public.academias,
         jsonb_array_elements_text(main_services) AS servicio_item
    WHERE is_active = true
    GROUP BY servicio_item
    ORDER BY cantidad DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de instalaciones más comunes
CREATE OR REPLACE FUNCTION estadisticas_instalaciones_academias()
RETURNS TABLE(instalacion TEXT, cantidad BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        instalacion_item AS instalacion,
        COUNT(*) AS cantidad
    FROM public.academias,
         jsonb_array_elements_text(additional_facilities) AS instalacion_item
    WHERE is_active = true
    GROUP BY instalacion_item
    ORDER BY cantidad DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista con información resumida de academias
CREATE OR REPLACE VIEW public.vista_academias_resumen AS
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
    number_of_courts,
    jsonb_array_length(main_services) as total_servicios,
    jsonb_array_length(additional_facilities) as total_instalaciones,
    avatar_url,
    created_at,
    is_active
FROM public.academias
WHERE is_active = true
ORDER BY business_name;

-- Vista para academias con servicios específicos de competición
CREATE OR REPLACE VIEW public.vista_academias_competicion AS
SELECT 
    a.*,
    CASE WHEN a.main_services ? 'entrenamientos-competicion' THEN true ELSE false END as entrena_competicion,
    CASE WHEN a.main_services ? 'torneos-internos' THEN true ELSE false END as organiza_torneos,
    CASE WHEN a.main_services ? 'clinics-especializados' THEN true ELSE false END as ofrece_clinics
FROM public.academias a
WHERE a.is_active = true
AND (
    a.main_services ? 'entrenamientos-competicion' OR
    a.main_services ? 'torneos-internos' OR
    a.main_services ? 'clinics-especializados'
)
ORDER BY a.business_name;

-- Vista para academias especializadas en niños
CREATE OR REPLACE VIEW public.vista_academias_infantiles AS
SELECT 
    a.*,
    CASE WHEN a.main_services ? 'clases-infantiles' THEN true ELSE false END as clases_menores,
    CASE WHEN a.main_services ? 'campamentos-verano' THEN true ELSE false END as campamentos_verano
FROM public.academias a
WHERE a.is_active = true
AND (
    a.main_services ? 'clases-infantiles' OR
    a.main_services ? 'campamentos-verano'
)
ORDER BY a.business_name;

-- Vista de academias con más experiencia
CREATE OR REPLACE VIEW public.vista_academias_experimentadas AS
SELECT *
FROM public.academias
WHERE is_active = true
AND years_experience IN ('10-15', '15+')
ORDER BY 
    CASE years_experience
        WHEN '15+' THEN 1
        WHEN '10-15' THEN 2
        ELSE 3
    END,
    business_name;

-- =============================================
-- FUNCIONES DE VERIFICACIÓN
-- =============================================

-- Verificar que la tabla se creó correctamente
DO $$
BEGIN
    -- Verificar que la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'academias' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Error: La tabla academias no se creó correctamente';
    END IF;
    
    -- Verificar que los índices se crearon
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'academias' AND indexname = 'idx_academias_user_id') THEN
        RAISE EXCEPTION 'Error: Los índices de academias no se crearon correctamente';
    END IF;
    
    -- Verificar que las políticas RLS están habilitadas
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'academias' AND rowsecurity = true) THEN
        RAISE EXCEPTION 'Error: RLS no está habilitado en la tabla academias';
    END IF;
    
    RAISE NOTICE 'Tabla academias creada exitosamente con todas sus funcionalidades';
END
$$;

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Comentar/descomentar según necesidad
/*
INSERT INTO public.academias (
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
    number_of_courts,
    languages,
    main_services,
    additional_facilities
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Cambiar por un UUID real
    'Academia Padel Pro Madrid',
    'Carlos Rodríguez',
    'Academia de padel especializada en formación de jugadores de todos los niveles',
    'Calle Serrano 123, Madrid',
    '+34 91 123 4567',
    'info@padelpromarid.com',
    'https://www.padelpromadrid.com',
    '08:00',
    '22:00',
    '10-15',
    6,
    '["espanol", "ingles"]',
    '["clases-particulares", "clases-grupales", "entrenamientos-competicion", "torneos-internos"]',
    '["vestuarios", "duchas", "cafeteria", "parking", "wifi", "fisioterapeuta"]'
);
*/

-- =============================================
-- RESUMEN FINAL
-- =============================================

SELECT 'Tabla ACADEMIAS creada exitosamente' as resultado,
       'Incluye: estructura completa, validaciones, índices, RLS, funciones de búsqueda, vistas especializadas' as detalles; 