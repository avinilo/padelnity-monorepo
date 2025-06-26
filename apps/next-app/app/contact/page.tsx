import { Metadata } from "next"
import ContactPageClient from "./contact-client"

// Metadata export (must be outside client component)
export const metadata: Metadata = {
  title: "Contacto - Padelnity",
  description: "Contacta con el equipo de Padelnity. Soporte técnico, consultas comerciales y asistencia personalizada.",
  keywords: ["contacto", "soporte", "ayuda", "padel", "Padelnity", "asistencia"],
  openGraph: {
    title: "Contacto - Padelnity",
    description: "Contacta con el equipo de Padelnity para cualquier consulta",
    type: "website",
  },
}

export default function ContactPage() {
  return <ContactPageClient />
} 