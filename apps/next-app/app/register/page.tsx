"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/ui/LoadingScreen"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir inmediatamente a la página principal que ahora es el registro
    router.replace('/')
  }, [router])

  return (
    <LoadingScreen 
      isVisible={true}
      message="Redirigiendo..."
      variant="fullscreen"
    />
  )
} 