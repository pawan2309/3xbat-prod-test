import { apiService, ApiResponse } from './api';
import { BetStats } from './dashboard';

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  marketName: string;
  odds: number;
  stake: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'VOID' | 'CANCELED';
  betCategory: 'MATCH' | 'SESSION' | 'CASINO';
  createdAt: string;
  user?: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
  match?: {
    id: string;
    matchName: string;
    externalMatchId: string;
    status: string;
  };
}

export interface BetFilters {
  matchId?: string;
  status?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface BetsResponse {
  bets: Bet[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}


export class BetService {
  async getBets(filters: BetFilters = {}): Promise<ApiResponse<BetsResponse>> {
    return apiService.get<BetsResponse>('/api/bets', filters);
  }

  async getBetById(id: string): Promise<ApiResponse<Bet>> {
    return apiService.get<Bet>(`/api/bets/${id}`);
  }

  async getUserBets(userId: string, filters: Omit<BetFilters, 'userId'> = {}): Promise<ApiResponse<BetsResponse>> {
    return apiService.get<BetsResponse>(`/api/bets/user/${userId}`, filters);
  }

  async getBetStats(userId?: string): Promise<ApiResponse<BetStats>> {
    const endpoint = userId ? `/api/bets/stats/${userId}` : '/api/bets/stats';
    return apiService.get<BetStats>(endpoint);
  }

  async updateBetStatus(id: string, status: string): Promise<ApiResponse<Bet>> {
    return apiService.put<Bet>(`/api/bets/${id}/status`, { status });
  }

  async placeBet(betData: {
    userId: string;
    marketName: string;
    odds: number;
    stake: number;
  }): Promise<ApiResponse<{ betId: string; message: string }>> {
    return apiService.post<{ betId: string; message: string }>('/api/bets/place', betData);
  }
}

export const betService = new BetService();
