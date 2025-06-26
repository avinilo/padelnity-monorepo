"use client";

import { useState, useEffect } from 'react';

export function useKeyboardDetection() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const initialHeight = window.visualViewport?.height || window.innerHeight;
    const initialWidth = window.innerWidth;
    setViewportHeight(initialHeight);
    
    // Determinar si es desktop (ancho > 768px)
    const desktopMode = initialWidth > 768;
    setIsDesktop(desktopMode);
    
    // En desktop, nunca mostrar el teclado como "abierto"
    if (desktopMode) {
      setIsKeyboardVisible(false);
      return;
    }

    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      
      const currentHeight = window.visualViewport.height;
      const heightDifference = initialHeight - currentHeight;
      
      // Solo en móvil: considerar que el teclado está visible si la diferencia es significativa (>150px)
      const keyboardVisible = !desktopMode && heightDifference > 150;
      
      setIsKeyboardVisible(keyboardVisible);
      setViewportHeight(currentHeight);
    };

    // Usar Visual Viewport API si está disponible (más preciso para teclados móviles)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    } else {
      // Fallback para navegadores que no soportan Visual Viewport API
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const currentWidth = window.innerWidth;
        const heightDifference = initialHeight - currentHeight;
        const currentDesktop = currentWidth > 768;
        
        setIsDesktop(currentDesktop);
        
        // Solo mostrar teclado en móvil
        const keyboardVisible = !currentDesktop && heightDifference > 150;
        setIsKeyboardVisible(keyboardVisible);
        setViewportHeight(currentHeight);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return {
    isKeyboardVisible,
    viewportHeight,
    isDesktop
  };
} 