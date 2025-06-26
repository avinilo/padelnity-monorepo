# Padelnity Web App

Aplicación web principal de Padelnity - Tu Comunidad Padelista.

## Stack Tecnológico

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: Zustand
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

## Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Estructura del Proyecto

```
apps/next-app/
├── app/                 # App Router (Next.js 13+)
├── components/          # Componentes React
├── lib/                # Utilidades y configuraciones
├── public/             # Assets estáticos
└── styles/             # Estilos globales
``` 