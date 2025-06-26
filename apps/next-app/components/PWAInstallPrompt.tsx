"use client"

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
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

// Configuration
const PWA_CONFIG = {
  storageKey: 'pwa-install-rejected',
  rejectDurations: {
    install: 7, // days
    dismiss: 3  // days
  },
  appInfo: {
    name: 'Padelnity',
    description: 'Acceso rápido desde tu pantalla de inicio',
    logo: 'P'
  }
} as const

// Custom hooks
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  const checkIfInstalled = useCallback(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isIOSInstalled = (window.navigator as any).standalone === true
    setIsInstalled(isInStandaloneMode || isIOSInstalled)
  }, [])

  const hasRejectedRecently = useCallback(() => {
    const rejectedDate = localStorage.getItem(PWA_CONFIG.storageKey)
    if (!rejectedDate) return false
    
    const expiryDate = new Date(rejectedDate)
    return new Date() < expiryDate
  }, [])

  const setRejectionExpiry = useCallback((days: number) => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)
    localStorage.setItem(PWA_CONFIG.storageKey, expiryDate.toISOString())
  }, [])

  const clearRejection = useCallback(() => {
    localStorage.removeItem(PWA_CONFIG.storageKey)
  }, [])

  useEffect(() => {
    checkIfInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      
      // Only show if not installed and not recently rejected
      if (!isInstalled && !hasRejectedRecently()) {
        setShowInstallPrompt(true)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      clearRejection()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, hasRejectedRecently, clearRejection, checkIfInstalled])

  return {
    deferredPrompt,
    showInstallPrompt,
    isInstalled,
    setShowInstallPrompt,
    setDeferredPrompt,
    setRejectionExpiry,
    checkIfInstalled
  }
}

// Memoized components
const AppLogo = memo(() => (
  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-lg">{PWA_CONFIG.appInfo.logo}</span>
  </div>
))

AppLogo.displayName = 'AppLogo'

const AppInfo = memo(() => (
  <div>
    <h3 className="font-semibold text-gray-900 text-sm">
      Instalar {PWA_CONFIG.appInfo.name}
    </h3>
    <p className="text-xs text-gray-600">
      {PWA_CONFIG.appInfo.description}
    </p>
  </div>
))

AppInfo.displayName = 'AppInfo'

export default function PWAInstallPrompt() {
  const {
    deferredPrompt,
    showInstallPrompt,
    isInstalled,
    setShowInstallPrompt,
    setDeferredPrompt,
    setRejectionExpiry
  } = usePWAInstall()

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      } else {
        // User rejected, remember for 7 days
        setRejectionExpiry(PWA_CONFIG.rejectDurations.install)
        setShowInstallPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch {
      // Silent error handling
      setShowInstallPrompt(false)
    }
  }, [deferredPrompt, setShowInstallPrompt, setDeferredPrompt, setRejectionExpiry])

  const handleDismiss = useCallback(() => {
    setShowInstallPrompt(false)
    // Remember dismissal for 3 days
    setRejectionExpiry(PWA_CONFIG.rejectDurations.dismiss)
  }, [setShowInstallPrompt, setRejectionExpiry])

  const shouldShow = useMemo(() => 
    !isInstalled && showInstallPrompt && deferredPrompt,
    [isInstalled, showInstallPrompt, deferredPrompt]
  )

  // Don't render if conditions not met
  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AppLogo />
            <AppInfo />
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