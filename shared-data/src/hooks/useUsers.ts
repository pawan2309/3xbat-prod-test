import { useState, useEffect, useCallback } from 'react';
import { userService, User, UserFilters, UsersResponse } from '../services/users';

interface UseUsersOptions {
  filters?: UserFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const { filters = {}, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUsers({
        ...filters,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(prev => ({
          ...prev,
          total: response.data!.pagination?.total || response.data!.users.length,
          totalPages: Math.ceil((response.data!.pagination?.total || response.data!.users.length) / pagination.limit),
          hasNext: response.data!.pagination?.hasMore || false,
          hasPrev: pagination.page > 1
        }));
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: UserFilters) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    // This will trigger a refetch when filters change
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchUsers, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchUsers]);

  // Refetch when filters change
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch,
    setPage,
    setLimit,
    updateFilters
  };
};
