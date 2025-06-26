import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import SupabaseProvider from "./auth-provider"

// Optimización de carga de fuente
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Mejora el rendimiento de carga
  preload: true
})

// Configuración del viewport optimizada
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981' // Color esmeralda consistente con los iconos
}

// Metadatos optimizados para SEO
export const metadata: Metadata = {
  title: "Padelnity | Tu Comunidad Padelista",
  description: "Gestiona torneos, conecta con jugadores y participa en ligas competitivas. La app definitiva para la comunidad padelista.",
  keywords: ["padel", "torneos", "comunidad", "deportes", "ligas", "competitivas"],
  authors: [{ name: "TerretaCode" }],
  creator: "TerretaCode",
  publisher: "Padelnity",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/icons/icon-192x192.png",
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Padelnity',
    'application-name': 'Padelnity',
    'msapplication-TileColor': '#10b981',
    'msapplication-tap-highlight': 'no',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'msapplication-square70x70logo': '/icons/icon-72x72.png',
    'msapplication-square150x150logo': '/icons/icon-152x152.png',
    'msapplication-square310x310logo': '/icons/icon-384x384.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Padelnity',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      }
    ],
  },
  openGraph: {
    title: "Padelnity | Tu Comunidad Padelista",
    description: "La app definitiva para la comunidad padelista. Gestiona torneos y conecta con jugadores.",
    type: "website",
    locale: "es_ES",
    url: "https://padelnity.vercel.app",
    siteName: "Padelnity",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Padelnity - Tu Comunidad Padelista",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Padelnity | Tu Comunidad Padelista",
    description: "La app definitiva para la comunidad padelista.",
    images: ["/og-image.png"],
    creator: "@padelnity",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        {/* Meta tags adicionales para iconos PWA */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon-192x192-maskable.png" color="#10b981" />
        
        {/* Meta tags específicos para Android */}
        <meta name="theme-color" content="#10b981" />
        <meta name="background-color" content="#10b981" />
      </head>
      <body 
        className={`${inter.className} h-full antialiased`}
        suppressHydrationWarning={true}
      >
        <SupabaseProvider>
          {children}
          <PWAInstallPrompt />
        </SupabaseProvider>
      </body>
    </html>
  )
} 