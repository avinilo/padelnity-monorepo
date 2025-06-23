import { useState, useCallback } from 'react'

interface LoadingState {
  isLoading: boolean
  message: string
}

interface UseLoadingStateReturn {
  isLoading: boolean
  message: string
  startLoading: (message: string) => void
  stopLoading: () => void
  executeWithLoading: <T>(
    operation: () => Promise<T>,
    loadingMessage: string
  ) => Promise<T>
}

/**
 * Hook reutilizable para manejar estados de loading de forma consistente
 * Proporciona funciones para controlar loading states con mensajes descriptivos
 */
export function useLoadingState(
  initialMessage: string = "Cargando..."
): UseLoadingStateReturn {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: initialMessage
  })

  const startLoading = useCallback((message: string) => {
    setLoadingState({
      isLoading: true,
      message
    })
  }, [])

  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false
    }))
  }, [])

  const executeWithLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      loadingMessage: string
    ): Promise<T> => {
      startLoading(loadingMessage)
      
      try {
        const result = await operation()
        return result
      } catch (error) {
        throw error
      } finally {
        stopLoading()
      }
    },
    [startLoading, stopLoading]
  )

  return {
    isLoading: loadingState.isLoading,
    message: loadingState.message,
    startLoading,
    stopLoading,
    executeWithLoading
  }
} 