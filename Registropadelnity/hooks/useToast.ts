"use client"

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  description?: string
}

let toastContainer: HTMLElement | null = null
let toastId = 0

// Sistema de cola para toasts
const toastQueue: Toast[] = []
let currentToast: Toast | null = null
let isProcessingQueue = false

// Sistema de prevención de duplicados
const recentToasts = new Map<string, number>()
const DUPLICATE_PREVENTION_TIME = 3000 // 3 segundos
const TOAST_DISPLAY_TIME = 1500 // 1.5 segundos

// Limpiar toasts expirados del mapa de prevención
function cleanupRecentToasts() {
  const now = Date.now()
  const entries = Array.from(recentToasts.entries())
  for (const [key, timestamp] of entries) {
    if (now - timestamp > DUPLICATE_PREVENTION_TIME) {
      recentToasts.delete(key)
    }
  }
}

// Verificar si un toast es duplicado
function isDuplicateToast(title: string, description?: string): boolean {
  const key = `${title}|${description || ''}`
  const now = Date.now()
  
  cleanupRecentToasts()
  
  if (recentToasts.has(key)) {
    const lastTime = recentToasts.get(key)!
    if (now - lastTime < DUPLICATE_PREVENTION_TIME) {
      return true // Es duplicado
    }
  }
  
  recentToasts.set(key, now)
  return false
}

// Procesar la cola de toasts
function processToastQueue() {
  if (isProcessingQueue || currentToast || toastQueue.length === 0) {
    return
  }

  isProcessingQueue = true
  const nextToast = toastQueue.shift()!
  currentToast = nextToast
  
  createToastElement(nextToast)
  
  // Programar el siguiente toast
  setTimeout(() => {
    currentToast = null
    isProcessingQueue = false
    processToastQueue() // Procesar el siguiente en la cola
  }, TOAST_DISPLAY_TIME + 300) // Tiempo de display + animación de salida
}

// Agregar toast a la cola
function enqueueToast(toast: Toast) {
  // Verificar duplicados
  if (isDuplicateToast(toast.title, toast.description)) {
    return
  }
  
  toastQueue.push(toast)
  processToastQueue()
}

// Crear contenedor de toasts si no existe
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.className = 'fixed top-4 left-4 right-4 pointer-events-none space-y-2'
    
    // Z-INDEX MÁXIMO POSIBLE
    toastContainer.style.zIndex = '2147483647'
    toastContainer.style.position = 'fixed'
    
    // Posición absoluta en el DOM
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

// Crear toast visual
function createToastElement(toast: Toast) {
  const container = ensureToastContainer()
  
  // Limpiar cualquier toast anterior
  container.innerHTML = ''
  
  const toastEl = document.createElement('div')
  toastEl.id = `toast-${toast.id}`
  toastEl.className = `
    pointer-events-auto
    bg-white/95 backdrop-blur-sm
    border border-gray-200
    rounded-lg shadow-xl
    p-4 max-w-sm mx-auto
    transform transition-all duration-300 ease-out
    translate-y-[-20px] opacity-0
  `.trim().replace(/\s+/g, ' ')

  // Z-INDEX INDIVIDUAL TAMBIÉN AL MÁXIMO
  toastEl.style.zIndex = '2147483647'
  toastEl.style.position = 'relative'

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'error':
        return { icon: '❌', color: 'text-red-500' }
      case 'success':
        return { icon: '✅', color: 'text-emerald-500' }
      case 'info':
        return { icon: 'ℹ️', color: 'text-blue-500' }
      default:
        return { icon: '✅', color: 'text-emerald-500' }
    }
  }
  
  const { icon } = getIconAndColor(toast.type)

  // Crear contenedor principal
  const mainDiv = document.createElement('div')
  mainDiv.className = 'flex items-start space-x-3'

  // Crear icono
  const iconDiv = document.createElement('div')
  iconDiv.className = 'flex-shrink-0 text-lg'
  iconDiv.textContent = icon

  // Crear contenido de texto
  const textDiv = document.createElement('div')
  textDiv.className = 'flex-1 min-w-0'
  
  const titleP = document.createElement('p')
  titleP.className = 'text-sm font-semibold text-gray-900'
  titleP.textContent = toast.title
  textDiv.appendChild(titleP)

  if (toast.description) {
    const descP = document.createElement('p')
    descP.className = 'text-sm text-gray-600 mt-1'
    descP.textContent = toast.description
    textDiv.appendChild(descP)
  }

  // Crear botón de cierre
  const closeButton = document.createElement('button')
  closeButton.className = 'flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2 cursor-pointer'
  closeButton.setAttribute('aria-label', 'Cerrar notificación')
  closeButton.style.pointerEvents = 'auto'
  
  // Crear SVG del botón
  closeButton.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  `

  // Agregar event listener DIRECTAMENTE al botón
  closeButton.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleToastClose(toast.id)
  })

  // Ensamblar el toast
  mainDiv.appendChild(iconDiv)
  mainDiv.appendChild(textDiv)
  mainDiv.appendChild(closeButton)
  toastEl.appendChild(mainDiv)

  container.appendChild(toastEl)

  // Animar entrada
  requestAnimationFrame(() => {
    toastEl.style.transform = 'translateY(0)'
    toastEl.style.opacity = '1'
  })

  // Auto remove después del tiempo configurado
  setTimeout(() => {
    if (document.getElementById(`toast-${toast.id}`)) {
      removeToast(toast.id)
    }
  }, TOAST_DISPLAY_TIME)
}

// Manejar el cierre manual del toast
function handleToastClose(toastId: string) {
  removeToast(toastId)
  
  // Procesar el siguiente toast en la cola
  currentToast = null
  isProcessingQueue = false
  setTimeout(() => {
    processToastQueue()
  }, 300) // Pequeño delay para la animación
}

function removeToast(id: string) {
  const toastEl = document.getElementById(`toast-${id}`)
  if (toastEl) {
    toastEl.style.transform = 'translateY(-20px)'
    toastEl.style.opacity = '0'
    setTimeout(() => {
      toastEl.remove()
    }, 300)
  }
}

export function useToast() {
  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = (++toastId).toString()
    const toast: Toast = { id, type, title, description }
    enqueueToast(toast)
  }, [])

  return {
    toast: {
      error: (title: string, description?: string) => {
        showToast('error', title, description)
      },
      success: (title: string, description?: string) => {
        showToast('success', title, description)
      },
      info: (title: string, description?: string) => {
        showToast('info', title, description)
      }
    }
  }
} 