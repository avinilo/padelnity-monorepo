import { Metadata } from "next"
import PrivacyPageClient from "./privacy-client"

// Metadata export (must be outside client component)
export const metadata: Metadata = {
  title: "Política de Privacidad - Padelnity",
  description: "Política de privacidad y protección de datos de Padelnity. Conoce cómo protegemos tu información personal.",
  keywords: ["privacidad", "protección datos", "GDPR", "padel", "Padelnity"],
  openGraph: {
    title: "Política de Privacidad - Padelnity",
    description: "Política de privacidad y protección de datos de Padelnity",
    type: "website",
  },
}

export default function PrivacyPage() {
  return <PrivacyPageClient />
} 