import { BaseApiService } from './BaseApiService';
import { Bet, ApiResponse, FilterOptions, UserStats } from '../types';

export class BetService extends BaseApiService {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * Get all bets with optional filtering
   */
  async getBets(filters?: FilterOptions): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/bets', filters);
  }

  /**
   * Get a specific bet by ID
   */
  async getBetById(betId: string): Promise<ApiResponse<Bet>> {
    return this.get<Bet>(`/bets/${betId}`);
  }

  /**
   * Get bets for a specific user
   */
  async getUserBets(
    userId: string,
    filters?: FilterOptions
  ): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>(`/bets/user/${userId}`, filters);
  }

  /**
   * Get bets for a specific match
   */
  async getMatchBets(
    matchId: string,
    filters?: FilterOptions
  ): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>(`/bets/match/${matchId}`, filters);
  }

  /**
   * Get pending bets
   */
  async getPendingBets(): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/bets', { status: 'PENDING' });
  }

  /**
   * Get won bets
   */
  async getWonBets(): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/bets', { status: 'WON' });
  }

  /**
   * Get lost bets
   */
  async getLostBets(): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/bets', { status: 'LOST' });
  }

  /**
   * Place a new bet
   */
  async placeBet(betData: {
    userId: string;
    marketName: string;
    odds: number;
    stake: number;
    matchId?: string;
    marketId?: string;
    betType?: string;
  }): Promise<ApiResponse<Bet>> {
    return this.post<Bet>('/bets/create', betData);
  }

  /**
   * Update bet status
   */
  async updateBetStatus(
    betId: string,
    status: string,
    result?: string
  ): Promise<ApiResponse<Bet>> {
    return this.patch<Bet>(`/bets/${betId}/status`, { status, result });
  }

  /**
   * Cancel a bet
   */
  async cancelBet(betId: string): Promise<ApiResponse<Bet>> {
    return this.patch<Bet>(`/bets/${betId}/cancel`);
  }

  /**
   * Void a bet
   */
  async voidBet(betId: string): Promise<ApiResponse<Bet>> {
    return this.patch<Bet>(`/bets/${betId}/void`);
  }

  /**
   * Get bet statistics for a user
   */
  async getUserBetStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.get<UserStats>(`/bets/user/${userId}/stats`);
  }

  /**
   * Get bet statistics for a match
   */
  async getMatchBetStats(matchId: string): Promise<ApiResponse<{
    totalBets: number;
    totalAmount: number;
    totalWon: number;
    totalLost: number;
    pendingBets: number;
  }>> {
    return this.get(`/bets/match/${matchId}/stats`);
  }

  /**
   * Get categorized bets for a user
   */
  async getUserCategorizedBets(userId: string): Promise<ApiResponse<{
    matchBets: Bet[];
    sessionBets: Bet[];
    casinoBets: Bet[];
    allBets: Bet[];
    total: number;
  }>> {
    return this.get(`/bets/user/${userId}/categorized`);
  }

  /**
   * Get bet history with pagination
   */
  async getBetHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: FilterOptions
  ): Promise<ApiResponse<Bet[]>> {
    const offset = (page - 1) * limit;
    return this.get<Bet[]>('/bets', {
      ...filters,
      userId,
      limit,
      offset,
    });
  }

  /**
   * Search bets by market name or bet type
   */
  async searchBets(query: string): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/bets', { search: query });
  }

  /**
   * Get bets by date range
   */
  async getBetsByDateRange(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/bets', {
      dateFrom: startDate,
      dateTo: endDate,
      userId,
    });
  }
}
