import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Padelnity - Red Social de Pádel",
    template: "%s | Padelnity"
  },
  description: "La red social definitiva para la comunidad de pádel. Conecta con jugadores, encuentra clubs, comparte experiencias y mejora tu juego.",
  keywords: ["pádel", "padel", "red social", "deporte", "comunidad", "clubs", "jugadores", "torneos"],
  authors: [{ name: "Padelnity Team" }],
  creator: "Padelnity",
  publisher: "Padelnity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://padelnity.com'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    title: "Padelnity - Red Social de Pádel",
    description: "La red social definitiva para la comunidad de pádel. Conecta con jugadores, encuentra clubs y mejora tu juego.",
    siteName: "Padelnity",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Padelnity - Red Social de Pádel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Padelnity - Red Social de Pádel",
    description: "La red social definitiva para la comunidad de pádel. Conecta con jugadores, encuentra clubs y mejora tu juego.",
    images: ["/og-image.png"],
    creator: "@padelnity",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Padelnity" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <div id="app" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
