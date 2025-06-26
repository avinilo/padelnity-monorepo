"use client";

import { useState, useCallback } from 'react';

export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setError(null); // Clear error when starting new operation
    }
  }, []);

  const setErrorState = useCallback((error: Error | null) => {
    setError(error);
    if (error) {
      setIsLoading(false); // Stop loading when error occurs
    }
  }, []);

  const executeWithLoading = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setErrorState(error);
      return null;
    }
  }, [setLoading, setErrorState]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    loading: isLoading, // Alias para compatibilidad
    error,
    setLoading,
    setError: setErrorState,
    executeWithLoading,
    reset,
    clearError,
  };
} 