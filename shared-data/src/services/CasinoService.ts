import { BaseApiService } from './BaseApiService';
import { CasinoGame, ApiResponse, FilterOptions } from '../types';

export class CasinoService extends BaseApiService {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * Get all casino games
   */
  async getCasinoGames(filters?: FilterOptions): Promise<ApiResponse<CasinoGame[]>> {
    return this.get<CasinoGame[]>('/casino/games', filters);
  }

  /**
   * Get a specific casino game by ID
   */
  async getCasinoGameById(gameId: string): Promise<ApiResponse<CasinoGame>> {
    return this.get<CasinoGame>(`/casino/games/${gameId}`);
  }

  /**
   * Get active casino games
   */
  async getActiveCasinoGames(): Promise<ApiResponse<CasinoGame[]>> {
    return this.get<CasinoGame[]>('/casino/games', { status: 'ACTIVE' });
  }

  /**
   * Get casino games by type
   */
  async getCasinoGamesByType(gameType: string): Promise<ApiResponse<CasinoGame[]>> {
    return this.get<CasinoGame[]>('/casino/games', { gameType });
  }

  /**
   * Create a new casino game
   */
  async createCasinoGame(gameData: Partial<CasinoGame>): Promise<ApiResponse<CasinoGame>> {
    return this.post<CasinoGame>('/casino/games', gameData);
  }

  /**
   * Update casino game status
   */
  async updateCasinoGameStatus(
    gameId: string,
    status: string
  ): Promise<ApiResponse<CasinoGame>> {
    return this.patch<CasinoGame>(`/casino/games/${gameId}/status`, { status });
  }

  /**
   * Update casino game settings
   */
  async updateCasinoGameSettings(
    gameId: string,
    settings: {
      minBet?: number;
      maxBet?: number;
      houseEdge?: number;
    }
  ): Promise<ApiResponse<CasinoGame>> {
    return this.patch<CasinoGame>(`/casino/games/${gameId}/settings`, settings);
  }

  /**
   * Delete a casino game
   */
  async deleteCasinoGame(gameId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/casino/games/${gameId}`);
  }

  /**
   * Get casino game statistics
   */
  async getCasinoGameStats(gameId: string): Promise<ApiResponse<{
    totalBets: number;
    totalAmount: number;
    playersOnline: number;
    lastResult: string;
    nextDraw: string;
  }>> {
    return this.get(`/casino/games/${gameId}/stats`);
  }

  /**
   * Get all casino games statistics
   */
  async getAllCasinoStats(): Promise<ApiResponse<{
    totalGames: number;
    activeGames: number;
    totalBets: number;
    totalAmount: number;
    totalPlayers: number;
  }>> {
    return this.get('/casino/stats');
  }

  /**
   * Start a casino game
   */
  async startCasinoGame(gameId: string): Promise<ApiResponse<CasinoGame>> {
    return this.post<CasinoGame>(`/casino/games/${gameId}/start`);
  }

  /**
   * Stop a casino game
   */
  async stopCasinoGame(gameId: string): Promise<ApiResponse<CasinoGame>> {
    return this.post<CasinoGame>(`/casino/games/${gameId}/stop`);
  }

  /**
   * Declare casino game result
   */
  async declareCasinoGameResult(
    gameId: string,
    result: string
  ): Promise<ApiResponse<CasinoGame>> {
    return this.post<CasinoGame>(`/casino/games/${gameId}/declare`, { result });
  }

  /**
   * Get casino game results history
   */
  async getCasinoGameResults(
    gameId: string,
    limit: number = 50
  ): Promise<ApiResponse<{
    results: Array<{
      id: string;
      result: string;
      timestamp: string;
    }>;
  }>> {
    return this.get(`/casino/games/${gameId}/results`, { limit });
  }

  /**
   * Search casino games
   */
  async searchCasinoGames(query: string): Promise<ApiResponse<CasinoGame[]>> {
    return this.get<CasinoGame[]>('/casino/games', { search: query });
  }

  /**
   * Get casino games by house edge range
   */
  async getCasinoGamesByHouseEdge(
    minEdge: number,
    maxEdge: number
  ): Promise<ApiResponse<CasinoGame[]>> {
    return this.get<CasinoGame[]>('/casino/games', {
      minHouseEdge: minEdge,
      maxHouseEdge: maxEdge,
    });
  }

  /**
   * Get casino games by bet range
   */
  async getCasinoGamesByBetRange(
    minBet: number,
    maxBet: number
  ): Promise<ApiResponse<CasinoGame[]>> {
    return this.get<CasinoGame[]>('/casino/games', {
      minBet,
      maxBet,
    });
  }
}
