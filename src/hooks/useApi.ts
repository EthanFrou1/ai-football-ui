/**
 * Hooks personnalisés pour gérer les appels API
 * Gère automatiquement loading, error et data
 */

import { useState, useEffect, useCallback } from 'react';
import type { ApiError } from '../types/api';

// Hook générique pour les appels API
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err as ApiError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  };
}

// Hook pour les recherches avec debounce
export function useApiSearch<T>(
  searchFn: (query: string) => Promise<T>,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState<string>('');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await searchFn(query);
        setData(result);
      } catch (err) {
        setError(err as ApiError);
        setData(null);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchFn, debounceMs]);

  return {
    query,
    setQuery,
    data,
    loading,
    error,
  };
}

// Hook pour gérer la pagination (pour futures fonctionnalités)
export function useApiPagination<T>(
  fetchFn: (page: number, limit: number) => Promise<T[]>,
  limit: number = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadPage = useCallback(
    async (pageNumber: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(pageNumber, limit);
        
        if (append) {
          setData(prev => [...prev, ...result]);
        } else {
          setData(result);
        }
        
        setHasMore(result.length === limit);
        setPage(pageNumber);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, limit]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPage(page + 1, true);
    }
  }, [loadPage, page, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    page,
  };
}