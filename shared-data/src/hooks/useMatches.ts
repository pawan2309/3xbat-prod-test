import { useState, useEffect, useCallback } from 'react';
import { matchService, Match, MatchFilters, MatchesResponse } from '../services/matches';

interface UseMatchesOptions {
  filters?: MatchFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useMatches = (options: UseMatchesOptions = {}) => {
  const { filters = {}, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await matchService.getMatches({
        ...filters,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      });

      if (response.success && response.data) {
        setMatches(response.data.matches);
        setPagination(prev => ({
          ...prev,
          total: response.data!.pagination.total,
          totalPages: Math.ceil(response.data!.pagination.total / pagination.limit),
          hasNext: response.data!.pagination.hasMore,
          hasPrev: pagination.page > 1
        }));
      } else {
        setError(response.error || 'Failed to fetch matches');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const refetch = useCallback(() => {
    fetchMatches();
  }, [fetchMatches]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: MatchFilters) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    // This will trigger a refetch when filters change
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMatches, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchMatches]);

  // Refetch when filters change
  useEffect(() => {
    fetchMatches();
  }, [filters]);

  return {
    matches,
    loading,
    error,
    pagination,
    refetch,
    setPage,
    setLimit,
    updateFilters
  };
};
