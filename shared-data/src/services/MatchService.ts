import { BaseApiService } from './BaseApiService';
import { Match, ApiResponse, FilterOptions, PaginationInfo } from '../types';

export class MatchService extends BaseApiService {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * Get all matches with optional filtering
   */
  async getMatches(filters?: FilterOptions): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches', filters);
  }

  /**
   * Get a specific match by ID
   */
  async getMatchById(matchId: string): Promise<ApiResponse<Match>> {
    return this.get<Match>(`/matches/${matchId}`);
  }

  /**
   * Get live matches
   */
  async getLiveMatches(): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches/inplay');
  }

  /**
   * Get upcoming matches
   */
  async getUpcomingMatches(): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches/upcoming');
  }

  /**
   * Get completed matches
   */
  async getCompletedMatches(): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches/completed');
  }

  /**
   * Create a new match
   */
  async createMatch(matchData: Partial<Match>): Promise<ApiResponse<Match>> {
    return this.post<Match>('/matches/create', matchData);
  }

  /**
   * Update match status
   */
  async updateMatchStatus(
    matchId: string,
    status: string
  ): Promise<ApiResponse<Match>> {
    return this.patch<Match>(`/matches/${matchId}/status`, { status });
  }

  /**
   * Delete a match
   */
  async deleteMatch(matchId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/matches/${matchId}`);
  }

  /**
   * Get matches by series
   */
  async getMatchesBySeries(series: string): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches', { series });
  }

  /**
   * Get matches by venue
   */
  async getMatchesByVenue(venue: string): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches', { venue });
  }

  /**
   * Search matches by name
   */
  async searchMatches(query: string): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/matches', { search: query });
  }

  /**
   * Get match statistics
   */
  async getMatchStats(): Promise<ApiResponse<{
    total: number;
    live: number;
    upcoming: number;
    completed: number;
  }>> {
    return this.get('/matches/stats');
  }
}
