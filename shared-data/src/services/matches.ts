import { apiService, ApiResponse } from './api';
import { Bet } from './bets';

export interface Match {
  id: string;
  matchName: string;
  externalMatchId: string;
  series: string;
  status: 'not_started' | 'live' | 'completed' | 'cancelled';
  startTime: string;
  createdAt: string;
  updatedAt: string;
  clientVisible?: boolean;
  bets?: Bet[];
}

export interface MatchFilters {
  status?: string;
  limit?: number;
  offset?: number;
}

export interface MatchesResponse {
  matches: Match[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class MatchService {
  async getMatches(filters: MatchFilters = {}): Promise<ApiResponse<MatchesResponse>> {
    return apiService.get<MatchesResponse>('/api/matches', filters);
  }

  async getMatchById(id: string): Promise<ApiResponse<Match>> {
    return apiService.get<Match>(`/api/matches/${id}`);
  }

  async updateMatchStatus(id: string, status: string): Promise<ApiResponse<Match>> {
    return apiService.put<Match>(`/api/matches/${id}/status`, { status });
  }

  async toggleClientVisibility(id: string, visible: boolean): Promise<ApiResponse<Match>> {
    return apiService.put<Match>(`/api/matches/${id}/visibility`, { clientVisible: visible });
  }

  async declareResult(id: string, result: any): Promise<ApiResponse<Match>> {
    return apiService.put<Match>(`/api/matches/${id}/result`, result);
  }
}

export const matchService = new MatchService();
