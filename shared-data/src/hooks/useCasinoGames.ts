import { useState, useEffect, useCallback } from 'react';
import { CasinoService } from '../services';
import { CasinoGame, FilterOptions, ApiResponse } from '../types';

export interface UseCasinoGamesOptions {
  filters?: FilterOptions;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseCasinoGamesReturn {
  games: CasinoGame[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createGame: (gameData: Partial<CasinoGame>) => Promise<void>;
  updateGameStatus: (gameId: string, status: string) => Promise<void>;
  updateGameSettings: (gameId: string, settings: any) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  startGame: (gameId: string) => Promise<void>;
  stopGame: (gameId: string) => Promise<void>;
  declareResult: (gameId: string, result: string) => Promise<void>;
}

export function useCasinoGames(options: UseCasinoGamesOptions = {}): UseCasinoGamesReturn {
  const { filters, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const casinoService = new CasinoService();

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: ApiResponse<CasinoGame[]> = await casinoService.getCasinoGames(filters);
      
      if (response.success && response.data) {
        setGames(response.data);
      } else {
        setError(response.error || 'Failed to fetch casino games');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createGame = useCallback(async (gameData: Partial<CasinoGame>) => {
    try {
      const response = await casinoService.createCasinoGame(gameData);
      
      if (response.success && response.data) {
        setGames(prev => [response.data!, ...prev]);
      } else {
        setError(response.error || 'Failed to create casino game');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create casino game');
    }
  }, []);

  const updateGameStatus = useCallback(async (gameId: string, status: string) => {
    try {
      const response = await casinoService.updateCasinoGameStatus(gameId, status);
      
      if (response.success && response.data) {
        setGames(prev => 
          prev.map(game => 
            game.id === gameId ? { ...game, status: status as any } : game
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game status');
    }
  }, []);

  const updateGameSettings = useCallback(async (gameId: string, settings: any) => {
    try {
      const response = await casinoService.updateCasinoGameSettings(gameId, settings);
      
      if (response.success && response.data) {
        setGames(prev => 
          prev.map(game => 
            game.id === gameId ? { ...game, ...settings } : game
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game settings');
    }
  }, []);

  const deleteGame = useCallback(async (gameId: string) => {
    try {
      const response = await casinoService.deleteCasinoGame(gameId);
      
      if (response.success) {
        setGames(prev => prev.filter(game => game.id !== gameId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete casino game');
    }
  }, []);

  const startGame = useCallback(async (gameId: string) => {
    try {
      const response = await casinoService.startCasinoGame(gameId);
      
      if (response.success && response.data) {
        setGames(prev => 
          prev.map(game => 
            game.id === gameId ? { ...game, status: 'ACTIVE' } : game
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start casino game');
    }
  }, []);

  const stopGame = useCallback(async (gameId: string) => {
    try {
      const response = await casinoService.stopCasinoGame(gameId);
      
      if (response.success && response.data) {
        setGames(prev => 
          prev.map(game => 
            game.id === gameId ? { ...game, status: 'INACTIVE' } : game
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop casino game');
    }
  }, []);

  const declareResult = useCallback(async (gameId: string, result: string) => {
    try {
      const response = await casinoService.declareCasinoGameResult(gameId, result);
      
      if (response.success && response.data) {
        setGames(prev => 
          prev.map(game => 
            game.id === gameId ? { ...game, lastResult: result } : game
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to declare casino game result');
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchGames, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchGames]);

  return {
    games,
    loading,
    error,
    refetch: fetchGames,
    createGame,
    updateGameStatus,
    updateGameSettings,
    deleteGame,
    startGame,
    stopGame,
    declareResult,
  };
}

// Specialized hooks for different game types
export function useActiveCasinoGames(options: UseCasinoGamesOptions = {}) {
  return useCasinoGames({ 
    ...options, 
    filters: { ...options.filters, status: 'ACTIVE' },
    autoRefresh: true 
  });
}

export function useCasinoGamesByType(gameType: string, options: UseCasinoGamesOptions = {}) {
  return useCasinoGames({ 
    ...options, 
    filters: { ...options.filters, gameType } 
  });
}

export function useCasinoGamesByHouseEdge(
  minEdge: number, 
  maxEdge: number, 
  options: UseCasinoGamesOptions = {}
) {
  return useCasinoGames({ 
    ...options, 
    filters: { 
      ...options.filters, 
      minHouseEdge: minEdge.toString(),
      maxHouseEdge: maxEdge.toString()
    } 
  });
}

export function useCasinoGamesByBetRange(
  minBet: number, 
  maxBet: number, 
  options: UseCasinoGamesOptions = {}
) {
  return useCasinoGames({ 
    ...options, 
    filters: { 
      ...options.filters, 
      minBet: minBet.toString(),
      maxBet: maxBet.toString()
    } 
  });
}
