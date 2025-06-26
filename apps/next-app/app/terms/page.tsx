import { Metadata } from "next"
import TermsPageClient from "./terms-client"

// Metadata export (must be outside client component)
export const metadata: Metadata = {
  title: "Términos y Condiciones - Padelnity",
  description: "Términos y condiciones de uso de Padelnity. Conoce las reglas y políticas de nuestra plataforma de torneos de pádel.",
  keywords: ["términos", "condiciones", "legal", "padel", "Padelnity", "torneos"],
  openGraph: {
    title: "Términos y Condiciones - Padelnity",
    description: "Términos y condiciones de uso de Padelnity",
    type: "website",
  },
}

export default function TermsPage() {
  return <TermsPageClient />
} 