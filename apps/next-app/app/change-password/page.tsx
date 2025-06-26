import { Metadata } from "next"
import ChangePasswordClient from "./change-password-client"

// Metadata export (must be outside client component)
export const metadata: Metadata = {
  title: "Cambiar Contraseña - Padelnity",
  description: "Cambia tu contraseña de forma segura en Padelnity. Actualiza tus credenciales de acceso fácilmente.",
  keywords: ["cambiar contraseña", "seguridad", "cuenta", "padel", "Padelnity"],
  openGraph: {
    title: "Cambiar Contraseña - Padelnity",
    description: "Cambia tu contraseña de forma segura en Padelnity",
    type: "website",
  },
}

export default function ChangePasswordPage() {
  return <ChangePasswordClient />
} 