# Flujo de Onboarding Automático - Padelnity

## 📋 Descripción General

Este documento describe el flujo de onboarding automático implementado en Padelnity que redirige a los usuarios nuevos o sin completar al proceso de configuración de perfil.

## 🚀 Flujo de Usuario

### **Para usuarios nuevos:**
1. **Registro** → `/register`
2. **Login automático** → Middleware intercepta
3. **Verificación de onboarding** → No completado
4. **Redirección** → `/onboarding/select-role`
5. **Selección de rol** → Jugador o Negocio
6. **Formulario correspondiente** → `/onboarding/player-setup` o `/onboarding/club-setup`
7. **Guardado en Supabase** → Marca `onboarding_complete: true`
8. **Redirección final** → `/dashboard`

### **Para usuarios que regresan:**
1. **Login** → `/login`
2. **Middleware verifica onboarding** → Completado
3. **Redirección directa** → `/dashboard`

## 🛠️ Archivos Implementados

### **1. Middleware (`middleware.ts`)**
```typescript
// Intercepta TODAS las rutas y verifica:
// - Autenticación
// - Estado de onboarding
// - Redirecciones automáticas
```

### **2. Base de Datos (`database_schema_padelnity.sql`)**
```sql
-- Tablas para almacenar perfiles:
-- - players: Información de jugadores
-- - businesses: Información de negocios
-- Ambas con flag onboarding_complete
```

### **3. Funciones de Utilidad (`lib/onboarding.ts`)**
```typescript
// Funciones para:
// - createPlayerProfile()
// - createBusinessProfile()
// - getOnboardingStatus()
// - uploadImage()
```

### **4. Hook Personalizado (`hooks/useOnboarding.ts`)**
```typescript
// Hook que proporciona:
// - Estado de onboarding en tiempo real
// - Refrescado automático
// - Manejo de errores
```

### **5. Página de Selección (`app/onboarding/select-role/page.tsx`)**
```typescript
// Página que permite elegir entre:
// - Jugador: Redirige a player-setup
// - Negocio: Redirige a club-setup
```

## 🔄 Estados del Middleware

| Ruta | Usuario No Auth | Usuario Auth Sin Onboarding | Usuario Auth Con Onboarding |
|------|-----------------|------------------------------|------------------------------|
| `/login` | Mostrar login | → `/onboarding/select-role` | → `/dashboard` |
| `/register` | Mostrar register | → `/onboarding/select-role` | → `/dashboard` |
| `/dashboard` | → `/login` | → `/onboarding/select-role` | Mostrar dashboard |
| `/onboarding/*` | → `/login` | Mostrar onboarding | → `/dashboard` |

## 📊 Estructura de Datos

### **Tabla Players**
```sql
-- Información personal
full_name VARCHAR(255) NOT NULL
ubicacion VARCHAR(255)
telefono VARCHAR(50)
biografia TEXT

-- Perfil de juego
nivel VARCHAR(50) NOT NULL
experiencia VARCHAR(50) NOT NULL
posicion_favorita VARCHAR(50) NOT NULL

-- Arrays JSON
objetivos JSONB
disponibilidad JSONB
idiomas JSONB
tipos_compañero JSONB

-- Estado
onboarding_complete BOOLEAN DEFAULT FALSE
```

### **Tabla Businesses**
```sql
-- Información básica
business_type VARCHAR(100) NOT NULL
business_name VARCHAR(255) NOT NULL
contact_name VARCHAR(255) NOT NULL
phone VARCHAR(50) NOT NULL
address TEXT NOT NULL

-- Configuración del negocio
number_of_courts INTEGER
court_types JSONB
main_services JSONB
payment_methods JSONB

-- Estado
onboarding_complete BOOLEAN DEFAULT FALSE
```

## ⚙️ Configuración Requerida

### **1. Variables de Entorno**
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### **2. Políticas RLS en Supabase**
```sql
-- Política para players
CREATE POLICY "Users can view own player profile" ON players
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own player profile" ON players
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para businesses (similar)
```

### **3. Storage Buckets**
```sql
-- Para imágenes de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true);
```

## 🎯 Funcionalidades Clave

### **✅ Redirección Inteligente**
- Detecta automáticamente si el usuario completó el onboarding
- Evita loops infinitos de redirección
- Funciona en tiempo real con cambios de sesión

### **✅ Guardado Completo de Datos**
- Todos los campos de los formularios se guardan en Supabase
- Incluye subida de imágenes (avatar y banner)
- Validación de datos requeridos

### **✅ Experiencia de Usuario Fluida**
- No necesita configuración manual
- Funciona automáticamente para todos los usuarios
- Interfaz consistente y moderna

### **✅ Seguridad**
- Validación server-side en middleware
- Políticas RLS en Supabase
- Manejo seguro de sesiones

## 🚀 Uso en Desarrollo

### **Para probar el flujo:**
1. Crear usuario nuevo en `/register`
2. Al hacer login será redirigido automáticamente
3. Completar el formulario correspondiente
4. Verificar que va al dashboard en siguientes logins

### **Para resetear onboarding:**
```sql
-- En Supabase, ejecutar:
UPDATE players SET onboarding_complete = false WHERE user_id = 'USER_ID';
-- O borrar el registro para empezar de cero:
DELETE FROM players WHERE user_id = 'USER_ID';
```

## 📝 Notas Importantes

- **El middleware se ejecuta en TODAS las rutas** excepto APIs y archivos estáticos
- **Las tablas deben existir** antes de que funcione el flujo
- **Los formularios existentes** ya están configurados para funcionar con este sistema
- **Es compatible** con la configuración actual de Supabase SSR

---

*Documentación actualizada para Padelnity v1.0 - Flujo de Onboarding Automático* 