# 🎾 PADELNITY v2.0 - GUÍA DE EJECUCIÓN COMPLETA

## 📋 ORDEN DE EJECUCIÓN DE SCRIPTS SQL

Para recrear la base de datos de Padelnity desde cero al cambiar de cuenta o proyecto de Supabase, ejecuta los scripts **EN ESTE ORDEN EXACTO**:

---

### ✅ **EJECUCIÓN SECUENCIAL OBLIGATORIA**

#### **1. CONFIGURACIÓN INICIAL**
```sql
-- EJECUTAR PRIMERO: Extensiones y Storage
00_configuracion_inicial.sql
```
- ✨ Instala extensiones: `uuid-ossp`, `pgcrypto`, `pg_trgm`, `unaccent`
- 📁 Crea buckets de storage: `avatars` (5MB), `banners` (10MB)
- ⚙️ Configuración base del sistema

#### **2. TABLAS ESPECIALIZADAS (Ejecutar en orden)**
```sql
-- JUGADORES
01_tabla_players.sql

-- CLUBES DE PADEL
02_tabla_clubs.sql

-- TIENDAS DE MATERIAL
03_tabla_tiendas.sql

-- ACADEMIAS/ESCUELAS
04_tabla_academias.sql

-- INSTALACIONES DEPORTIVAS
05_tabla_instalaciones.sql
```

#### **3. POLÍTICAS DE SEGURIDAD**
```sql
-- POLÍTICAS DE STORAGE
06_politicas_storage.sql
```
- 🔒 Políticas RLS para avatars y banners
- 🛡️ Acceso público para visualización, privado para gestión

#### **4. FUNCIONES GLOBALES**
```sql
-- FUNCIONES Y VISTAS UNIFICADAS
07_funciones_globales.sql
```
- 🔍 Sistema de búsqueda unificada
- 📊 Funciones de estadísticas globales
- 👤 Perfil unificado de usuario
- 📈 Vistas y utilidades

#### **5. VERIFICACIÓN FINAL**
```sql
-- VERIFICACIÓN COMPLETA DEL SISTEMA
08_verificacion_completa.sql
```
- ✅ Verifica que todo esté correctamente configurado
- 🧪 Ejecuta pruebas de inserción de datos
- 📋 Muestra resumen completo del sistema

#### **6. REDES SOCIALES Y URLS PERMISIVAS**
```sql
-- MEJORAS ADICIONALES
09_redes_sociales_y_urls.sql
```
- 📱 Agrega campos de redes sociales (Instagram, Facebook, Twitter, LinkedIn)
- 🔗 Hace las URLs más permisivas (acepta dominios sin https://)
- 🛠️ Funciones de normalización de URLs
- ✨ Aplicable a todas las tablas existentes

---

## 🚀 **INSTRUCCIONES DE USO**

### **Opción A: Ejecución Manual**
1. Abre el editor SQL de Supabase
2. Copia y pega cada script **uno por uno**
3. Ejecuta en el orden indicado
4. Verifica que no hay errores antes de continuar

### **Opción B: Ejecución por Lotes**
```bash
# Si tienes acceso a psql
psql -h [host] -U [usuario] -d [database] -f 00_configuracion_inicial.sql
psql -h [host] -U [usuario] -d [database] -f 01_tabla_players.sql
psql -h [host] -U [usuario] -d [database] -f 02_tabla_clubs.sql
psql -h [host] -U [usuario] -d [database] -f 03_tabla_tiendas.sql
psql -h [host] -U [usuario] -d [database] -f 04_tabla_academias.sql
psql -h [host] -U [usuario] -d [database] -f 05_tabla_instalaciones.sql
psql -h [host] -U [usuario] -d [database] -f 06_politicas_storage.sql
psql -h [host] -U [usuario] -d [database] -f 07_funciones_globales.sql
psql -h [host] -U [usuario] -d [database] -f 08_verificacion_completa.sql
psql -h [host] -U [usuario] -d [database] -f 09_redes_sociales_y_urls.sql
```

---

## 📊 **QUÉ SE CREA EN CADA SCRIPT**

### **00_configuracion_inicial.sql**
- 4 extensiones PostgreSQL
- 2 buckets de storage
- Verificación de configuración

### **01_tabla_players.sql** (379 líneas)
- Tabla `players` con perfil completo de jugador
- 20+ campos específicos de padel
- Políticas RLS, índices, funciones, vistas
- Sistema de compatibilidad entre jugadores

### **02_tabla_clubs.sql** (500 líneas)
- Tabla `clubs` con información completa de clubes
- Sistema de reservas y servicios
- Políticas RLS (incluye acceso anónimo)
- Funciones de búsqueda especializadas

### **03_tabla_tiendas.sql** (525 líneas)
- Tabla `tiendas` con catálogo de productos
- Servicios comerciales y experiencia
- Funciones de búsqueda por productos
- Estadísticas específicas

### **04_tabla_academias.sql** (378 líneas)
- Tabla `academias` con servicios educativos
- Niveles de enseñanza e idiomas
- Certificaciones de instructores
- Tipos de clases disponibles

### **05_tabla_instalaciones.sql** (459 líneas)
- Tabla `instalaciones` deportivas
- Enfoque específico en padel
- Otros deportes disponibles
- Servicios de instalación

### **06_politicas_storage.sql** (280 líneas)
- 8 políticas de storage (avatars + banners)
- Acceso público para visualización
- Gestión privada por usuario
- Manejo robusto de errores

### **07_funciones_globales.sql** (420 líneas)
- Búsqueda unificada en todas las tablas
- Estadísticas globales del sistema
- Perfil unificado de usuario
- Vistas y funciones de utilidad

### **08_verificacion_completa.sql** (650 líneas)
- Verificación exhaustiva del sistema
- Pruebas de inserción de datos
- Resumen completo de métricas
- Diagnóstico de problemas

### **09_redes_sociales_y_urls.sql** (180 líneas)
- Campos de redes sociales para todas las tablas
- Funciones de normalización de URLs
- Validación permisiva de URLs (acepta dominios simples)
- Soporte para usernames de redes sociales

---

## ⚠️ **NOTAS IMPORTANTES**

### **ANTES DE EJECUTAR**
- ✅ Asegúrate de tener permisos de administrador en Supabase
- ✅ Haz backup de datos existentes si los hay
- ✅ Verifica que la base de datos esté vacía o lista para recrear

### **DURANTE LA EJECUCIÓN**
- 🔍 Revisa cada mensaje de confirmación
- ⚠️ No continúes si hay errores en scripts anteriores
- 📝 Los scripts muestran mensajes informativos de progreso

### **DESPUÉS DE EJECUTAR**
- ✅ El script 08 debe mostrar todo en estado "OK"
- 📊 Revisa el resumen final de métricas
- 🧪 Las pruebas de inserción deben pasar correctamente

---

## 🎯 **RESULTADO FINAL**

Al completar todos los scripts tendrás:

- **5 tablas especializadas** (players, clubs, tiendas, academias, instalaciones)
- **+40 índices** de optimización
- **+25 políticas RLS** de seguridad
- **8 políticas de storage** para imágenes
- **+15 funciones** de utilidad y búsqueda
- **5+ vistas** para consultas complejas
- **5 triggers** automáticos
- **4 extensiones** PostgreSQL
- **2 buckets** de almacenamiento

### **TOTAL: +2,500 líneas de código SQL optimizado**

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### **Error en extensiones**
```sql
-- Si falla la instalación de extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

### **Error en storage buckets**
- Ve al panel de Supabase → Storage
- Crea manualmente los buckets `avatars` y `banners`
- Configura como públicos con límites de 5MB y 10MB

### **Error en políticas RLS**
- Algunas políticas pueden requerir permisos especiales
- Usa el panel de Supabase para crear políticas manualmente
- Los scripts incluyen manejo de errores robusto

### **Verificación fallida**
```sql
-- Ejecuta la función de verificación individualmente
SELECT * FROM check_padelnity_complete_setup_v2();
```

---

## 📞 **SOPORTE**

Si encuentras problemas durante la ejecución:

1. **Revisa los mensajes de error** en el script de verificación
2. **Ejecuta scripts individualmente** para identificar el problema
3. **Consulta la documentación** de Supabase para permisos específicos
4. **Usa el panel web** de Supabase como alternativa para configuraciones manuales

---

**¡Sistema Padelnity v2.0 listo para producción! 🎾** 