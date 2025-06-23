"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      const isIOSInstalled = (window.navigator as any).standalone === true
      setIsInstalled(isInStandaloneMode || isIOSInstalled)
    }

    checkIfInstalled()

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Solo mostrar si no está instalado y no se ha rechazado antes
      const hasRejected = localStorage.getItem('pwa-install-rejected')
      if (!isInstalled && !hasRejected) {
        setShowInstallPrompt(true)
      }
    }

    // Escuchar cuando se instala la app
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-rejected')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      } else {
        // Usuario rechazó, recordar por 7 días
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 7)
        localStorage.setItem('pwa-install-rejected', expiryDate.toISOString())
        setShowInstallPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.warn('Error al mostrar prompt de instalación:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Recordar que se rechazó por 3 días
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 3)
    localStorage.setItem('pwa-install-rejected', expiryDate.toISOString())
  }

  // No mostrar si ya está instalado o no hay prompt disponible
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Instalar Padelnity
              </h3>
              <p className="text-xs text-gray-600">
                Acceso rápido desde tu pantalla de inicio
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="text-gray-600"
          >
            Ahora no
          </Button>
        </div>
      </div>
    </div>
  )
} 