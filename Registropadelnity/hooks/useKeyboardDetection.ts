'use client'

import { useState, useEffect } from 'react'

/**
 * Hook personalizado para detectar si el teclado virtual está abierto en dispositivos móviles
 * Detecta cambios en la altura de la ventana para determinar si el teclado está visible
 * 
 * @returns {boolean} true si el teclado está abierto, false en caso contrario
 */
export const useKeyboardDetection = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    // Solo detectar teclado en dispositivos móviles reales
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!isMobileDevice) return

    let initialHeight = window.innerHeight

    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDifference = initialHeight - currentHeight
      
      // Considerar teclado abierto si la altura disminuyó más de 150px
      setIsKeyboardOpen(heightDifference > 150)
    }

    // Establecer altura inicial después de un pequeño delay para medición correcta
    const timer = setTimeout(() => {
      initialHeight = window.innerHeight
    }, 100)

    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return isKeyboardOpen
} 