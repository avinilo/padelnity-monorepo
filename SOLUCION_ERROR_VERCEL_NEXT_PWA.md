# Solución: Error de Next.js PWA en Vercel Monorepo

## Problema Identificado

### Error Principal
```
[Error: Cannot find module 'next-pwa'
Require stack:
- /vercel/path0/apps/next-app/next.config.js] {
  code: 'MODULE_NOT_FOUND',
  requireStack: [Array]
}
```

### Contexto del Error
- **Entorno:** Vercel deployment en producción
- **Arquitectura:** Monorepo con Turborepo
- **Framework:** Next.js 15.3.4
- **PWA Plugin:** `@ducanh2912/next-pwa@10.2.9`

## Análisis del Problema

### 1. Resolución de Dependencias en Monorepos
En un monorepo con workspaces de npm, las dependencias pueden estar instaladas en diferentes niveles:
- **Workspace root:** `/package.json`
- **Subpackage:** `/apps/next-app/package.json`

### 2. Comportamiento de Vercel
Cuando Vercel procesa un monorepo:
1. Ejecuta `npm install` en el directorio raíz
2. Las dependencias se instalan según la configuración de workspaces
3. Durante el build, busca las dependencias para resolver imports en `next.config.js`

### 3. El Problema Específico
- `@ducanh2912/next-pwa` estaba instalado solo en `/apps/next-app/package.json`
- Vercel ejecutaba el build desde el workspace root
- Node.js no podía resolver el módulo durante la carga de `next.config.js`

## Soluciones Implementadas

### Solución 1: Dependencia en Workspace Root ✅

**Acción:** Agregar la dependencia PWA al `package.json` del workspace root

```json
{
  "name": "padelnity-monorepo",
  "dependencies": {
    "@ducanh2912/next-pwa": "^10.2.9"
  }
}
```

**Por qué funciona:**
- Las dependencias del workspace root están disponibles para todos los subpaquetes
- Node.js puede resolver el módulo durante la carga de configuración
- Turbo y Vercel tienen acceso directo a la dependencia

### Solución 2: Configuración Vercel.json Corregida ✅

**Problema:** Configuración inicial incorrecta
```json
{
  "rootDirectory": "apps/next-app"  // ❌ Propiedad no válida
}
```

**Solución:** Configuración optimizada para monorepo
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "turbo run build --filter=next-app",
  "outputDirectory": "apps/next-app/.next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Alternativas Consideradas

### Opción A: Hoisting Manual
```bash
npm install @ducanh2912/next-pwa --workspace-root
```

### Opción B: Configuración de Node Resolution
Modificar `next.config.js` para resolver la ruta manualmente:
```javascript
const withPWA = require(path.resolve('./apps/next-app/node_modules/@ducanh2912/next-pwa'))
```

### Opción C: Build Command Específico
```json
{
  "buildCommand": "cd apps/next-app && npm install && npm run build"
}
```

**Por qué elegimos la Solución 1:**
- ✅ Simplicidad y claridad
- ✅ Compatibilidad total con Turborepo
- ✅ Sin modificaciones complejas de configuración
- ✅ Mantenimiento futuro más fácil

## Lecciones Aprendidas

### 1. Gestión de Dependencias en Monorepos
- **Regla:** Dependencias de build/configuración deben estar en el workspace root
- **Razón:** Herramientas como Turbo y Vercel operan desde el directorio raíz

### 2. Diferencias Desarrollo vs Producción
- **Local:** Node.js puede resolver dependencias de subpaquetes
- **Vercel:** Resolución más estricta desde el directorio de ejecución

### 3. Configuración de Vercel para Monorepos
- Usar `turbo run build --filter=<package>` en lugar de comandos directos
- Evitar propiedades no estándar como `rootDirectory`
- Especificar `outputDirectory` correcto para el subpaquete

## Verificación de la Solución

### Build Local ✅
```bash
npm run build
# Tasks: 2 successful, 2 total
# Time: 12.527s
```

### Deploy Vercel ✅
```
✅ Production: https://padel-monorepo-dvxjukx93-vinilos-projects.vercel.app
Build Completed in /vercel/output [1m]
```

### Métricas Finales
- **Middleware:** 63.4 kB
- **Páginas generadas:** 21/21
- **PWA:** Service Worker funcionando
- **Tiempo de build:** ~1 minuto

## Recomendaciones para el Futuro

### 1. Estructura de Dependencias
```
monorepo/
├── package.json (build tools, shared deps)
├── apps/
│   └── next-app/
│       └── package.json (app-specific deps)
└── packages/
    └── ui/
        └── package.json (package deps)
```

### 2. Categorización de Dependencias
- **Root level:** Build tools, linters, formatters, PWA plugins
- **App level:** Framework-specific, UI libraries, API clients
- **Package level:** Utilities específicos del paquete

### 3. Testing de Deploy
- Siempre probar builds locales antes de deploy
- Usar `vercel --prod --yes` para deploys manuales
- Verificar resolución de dependencias en entornos limpios

## Comandos de Referencia

### Deploy Manual
```bash
vercel --prod --yes
```

### Verificar Dependencies
```bash
npm ls @ducanh2912/next-pwa
```

### Build Local con Turbo
```bash
turbo run build --filter=next-app
```

### Limpieza de Cache
```bash
npm run clean
rm -rf .turbo
rm -rf apps/next-app/.next
```

---

**Fecha de Resolución:** 26 de Diciembre, 2024  
**Tiempo de Resolución:** ~2 horas  
**Status:** ✅ Resuelto y documentado 