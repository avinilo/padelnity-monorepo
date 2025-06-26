import { Metadata } from "next"
import HelpCenterClient from "./help-client"

// Metadata export (must be outside client component)
export const metadata: Metadata = {
  title: "Centro de Ayuda - Padelnity",
  description: "Obtén ayuda instantánea con nuestro asistente inteligente. Resuelve tus dudas sobre torneos de pádel y el uso de la plataforma.",
  keywords: ["ayuda", "soporte", "chatbot", "asistente", "padel", "Padelnity", "torneos"],
  openGraph: {
    title: "Centro de Ayuda - Padelnity",
    description: "Obtén ayuda instantánea con nuestro asistente inteligente",
    type: "website",
  },
}

export default function HelpCenterPage() {
  return <HelpCenterClient />
} 