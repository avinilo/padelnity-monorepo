# 🚀 Configuración de Supabase para Padelnity

## 📋 Variables de Entorno Requeridas

Para que la aplicación funcione correctamente con Supabase, necesitas crear un archivo `.env.local` en `apps/next-app/` con las siguientes variables:

```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anonima-publica"
```

## 🔧 Cómo obtener las credenciales

1. **Ve a [supabase.com](https://supabase.com)** y crea una cuenta
2. **Crea un nuevo proyecto** eligiendo un nombre y región
3. **Obtén las credenciales**:
   - Ve a `Settings` > `API`
   - Copia la **Project URL** 
   - Copia la **anon public key**

## 🗃️ Configuración de Base de Datos

Ejecuta el siguiente SQL en tu **SQL Editor** de Supabase para crear las tablas necesarias:

```sql
-- 1. CREAR UN TIPO ENUMERADO PARA LOS ROLES
CREATE TYPE public.user_role AS ENUM ('jugador', 'club');

-- 2. CREAR LA TABLA 'profiles'
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'jugador',
  full_name TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  business_name TEXT,
  website TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HABILITAR LA SEGURIDAD A NIVEL DE FILA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS DE ACCESO
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. CREAR LA FUNCIÓN TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- 6. CREAR EL TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 🔑 Configuración de Autenticación OAuth

### Google OAuth
1. Ve a `Authentication` > `Providers` en Supabase
2. Activa **Google**
3. Configura Google Cloud Console:
   - Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
   - Habilita Google+ API
   - Crea credenciales OAuth 2.0
   - Agrega la URL de callback de Supabase

### Apple OAuth (Opcional)
1. Ve a `Authentication` > `Providers` en Supabase
2. Activa **Apple**
3. Configura Apple Developer Console según la guía de Supabase

## 📱 URLs de Callback

Agrega estas URLs en `Authentication` > `URL Configuration` > `Redirect URLs`:

```
http://localhost:3000/auth/callback
https://tu-dominio.com/auth/callback
```

## ✅ Estado Actual

- ✅ Clientes de Supabase creados (client.ts, server.ts)
- ✅ Hook useAuth implementado
- ✅ Hooks auxiliares creados (useToast, useLoadingState, useKeyboardDetection)
- ✅ Página de callback OAuth
- ✅ Integración con página de login existente
- ❌ **Variables de entorno por configurar** (necesitas hacerlo tú)
- ❌ **Base de datos por configurar** (ejecutar SQL arriba)

## 🚨 Siguiente Paso

**¡IMPORTANTE!** Para continuar necesitas:

1. **Crear las variables de entorno** como se indica arriba
2. **Ejecutar el SQL** para crear las tablas
3. **Configurar OAuth** si quieres login con Google/Apple

Una vez hecho esto, la aplicación debería funcionar correctamente con autenticación completa. 