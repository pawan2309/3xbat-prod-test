import { useState, useEffect, useCallback } from 'react';
import { betService, Bet, BetFilters, BetsResponse } from '../services/bets';

interface UseBetsOptions {
  filters?: BetFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useBets = (options: UseBetsOptions = {}) => {
  const { filters = {}, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [bets, setBets] = useState<Bet[]>([]);
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

  const fetchBets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await betService.getBets({
        ...filters,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      });

      if (response.success && response.data) {
        setBets(response.data.bets);
        setPagination(prev => ({
          ...prev,
          total: response.data!.pagination.total,
          totalPages: Math.ceil(response.data!.pagination.total / pagination.limit),
          hasNext: response.data!.pagination.hasMore,
          hasPrev: pagination.page > 1
        }));
      } else {
        setError(response.error || 'Failed to fetch bets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const refetch = useCallback(() => {
    fetchBets();
  }, [fetchBets]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: BetFilters) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    // This will trigger a refetch when filters change
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchBets, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchBets]);

  // Refetch when filters change
  useEffect(() => {
    fetchBets();
  }, [filters]);

  return {
    bets,
    loading,
    error,
    pagination,
    refetch,
    setPage,
    setLimit,
    updateFilters
  };
};
