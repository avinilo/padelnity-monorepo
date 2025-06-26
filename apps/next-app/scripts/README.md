# Scripts SQL de Padelnity

Esta carpeta contiene todos los scripts SQL necesarios para configurar completamente la base de datos de Supabase para la aplicación Padelnity.

## 📋 Orden de Ejecución

**IMPORTANTE:** Los scripts deben ejecutarse en el orden correcto para evitar errores de dependencias.

### 1. `01_initial_setup.sql`
- **Propósito:** Configuración inicial del sistema
- **Incluye:** Extensiones PostgreSQL y buckets de Storage
- **Tiempo estimado:** 1-2 minutos

### 2. `02_tables.sql`
- **Propósito:** Creación de todas las tablas principales
- **Incluye:** Tablas `players` y `businesses` con todos los campos específicos
- **Tiempo estimado:** 2-3 minutos

### 3. `03_rls_policies.sql`
- **Propósito:** Configuración de políticas de seguridad (RLS)
- **Incluye:** Políticas de acceso para ambas tablas
- **Tiempo estimado:** 1-2 minutos

### 4. `04_storage_policies.sql`
- **Propósito:** Configuración de políticas de Storage
- **Incluye:** Políticas para subir/gestionar imágenes (avatars y banners)
- **Tiempo estimado:** 1-2 minutos

### 5. `05_functions_views.sql`
- **Propósito:** Funciones útiles y vistas especializadas
- **Incluye:** Vistas por tipo de negocio y funciones de búsqueda
- **Tiempo estimado:** 2-3 minutos

### 6. `06_verification.sql`
- **Propósito:** Verificación completa del sistema
- **Incluye:** Pruebas de funcionamiento y diagnósticos
- **Tiempo estimado:** 1-2 minutos

## 🚀 Cómo Ejecutar

### Método Recomendado (Paso a Paso)
1. Abre el **SQL Editor** en tu Dashboard de Supabase
2. Copia y pega el contenido de cada script **en orden**
3. Ejecuta cada script **uno por uno**
4. Verifica que no hay errores antes de pasar al siguiente

### Método Rápido (Todos a la vez)
Si tienes experiencia, puedes crear un script master:

```sql
-- Copia el contenido de todos los archivos en orden:
-- 01_initial_setup.sql
-- 02_tables.sql  
-- 03_rls_policies.sql
-- 04_storage_policies.sql
-- 05_functions_views.sql
-- 06_verification.sql
```

## ✅ Verificación de Éxito

Después de ejecutar todos los scripts, deberías ver:

```
✅ ÉXITO: La configuración de Padelnity está completa y funcionando correctamente.
```

Si ves errores, consulta la sección de **Troubleshooting** más abajo.

## 📊 Lo Que Se Crea

### Tablas Principales
- **`players`** - Perfiles de jugadores de padel
- **`businesses`** - Perfiles de negocios (4 tipos: club, tienda, academia, instalación)

### Tipos de Negocio Soportados
1. **Club de Padel** - Clubes con pistas y servicios
2. **Tienda de Material** - Tiendas de equipamiento deportivo
3. **Academia/Escuela** - Centros de enseñanza de padel
4. **Instalación Deportiva** - Complejos deportivos con padel

### Funciones Útiles Disponibles
```sql
-- Estadísticas
SELECT * FROM get_business_stats();
SELECT * FROM get_player_stats();
SELECT * FROM get_daily_stats(30);

-- Búsquedas
SELECT * FROM search_businesses('Madrid', ARRAY['clases-particulares'], ARRAY['club']);
SELECT * FROM search_players('intermedio', 'Barcelona', '1-3 años');

-- Utilidades
SELECT * FROM get_user_profile('user-uuid-here');
```

### Vistas Especializadas
```sql
-- Por tipo de negocio
SELECT * FROM club_profiles;
SELECT * FROM tienda_profiles;
SELECT * FROM academia_profiles;
SELECT * FROM instalacion_profiles;
```

## 🔧 Troubleshooting

### Error: "Extension already exists"
- **Solución:** Normal, las extensiones ya están instaladas
- **Acción:** Continúa con el siguiente script

### Error: "Bucket already exists"
- **Solución:** Normal, los buckets ya están creados
- **Acción:** Continúa con el siguiente script

### Error: "Permission denied for relation"
- **Posible causa:** Problemas con RLS
- **Solución:** Re-ejecuta `03_rls_policies.sql`

### Error: "Function does not exist"
- **Posible causa:** Scripts ejecutados fuera de orden
- **Solución:** Ejecuta `05_functions_views.sql`

### Error: "new row violates row-level security policy"
- **Posible causa:** Usuario no autenticado en las pruebas
- **Solución:** Normal en el script de verificación, ignora este error específico

## 📝 Configuración Adicional Requerida

### 1. Variables de Entorno
Añade a tu `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_proyecto_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 2. Configuración de Autenticación
En **Dashboard > Authentication > Settings**:
- **Site URL:** `http://localhost:3000` (desarrollo) / `https://tudominio.com` (producción)
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `https://tudominio.com/auth/callback`

### 3. Configuración de Storage
Los buckets se crean automáticamente con estas configuraciones:
- **avatars:** 5MB máximo, archivos públicos
- **banners:** 10MB máximo, archivos públicos
- **Formatos permitidos:** JPG, PNG, WebP

## 🏗️ Estructura de Datos

### Campos Principales - Players
- Información personal (nombre, ubicación, teléfono)
- Perfil deportivo (nivel, experiencia, posición favorita)
- Preferencias (objetivos, disponibilidad, idiomas)

### Campos Principales - Businesses
- Información básica (nombre, dirección, contacto)
- Campos específicos por tipo de negocio
- Sistema de verificación y onboarding

### Campos Específicos por Tipo
- **Clubes:** Número de pistas, sistema de reservas, tipos de pista
- **Tiendas:** Categorías de productos, marcas disponibles, servicios
- **Academias:** Niveles de enseñanza, tipos de clases, certificaciones
- **Instalaciones:** Pistas de padel (obligatorio), otros deportes

## 🔄 Migración desde Versión Anterior

Si ya tienes datos en tablas existentes:
1. Los scripts crean automáticamente tablas de backup (`*_backup`)
2. Verifica los backups antes de proceder
3. Migra datos manualmente si es necesario

## 📞 Soporte

Si tienes problemas:
1. Verifica que ejecutaste los scripts en orden
2. Revisa los logs de error en Supabase
3. Ejecuta `06_verification.sql` para diagnóstico completo
4. Consulta la documentación de Supabase para errores específicos

---

**Última actualización:** Versión unificada con soporte completo para 4 tipos de negocios 