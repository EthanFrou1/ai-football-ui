// src/hooks/useDebouncedValue.ts
import { useState, useEffect } from 'react';

/**
 * Hook pour debouncer une valeur (utile pour les recherches en temps réel)
 * @param value - Valeur à debouncer
 * @param delay - Délai en millisecondes (default: 300ms)
 * @returns Valeur debouncée
 */
export const useDebouncedValue = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};