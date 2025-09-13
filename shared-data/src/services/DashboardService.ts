import { BaseApiService } from './BaseApiService';
import { DashboardStats, ApiResponse, Match, Bet, User } from '../types';

export class DashboardService extends BaseApiService {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>('/dashboard/stats');
  }

  /**
   * Get recent matches for dashboard
   */
  async getRecentMatches(limit: number = 10): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/dashboard/recent-matches', { limit });
  }

  /**
   * Get recent bets for dashboard
   */
  async getRecentBets(limit: number = 10): Promise<ApiResponse<Bet[]>> {
    return this.get<Bet[]>('/dashboard/recent-bets', { limit });
  }

  /**
   * Get recent users for dashboard
   */
  async getRecentUsers(limit: number = 10): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/dashboard/recent-users', { limit });
  }

  /**
   * Get live dashboard data (matches, bets, users)
   */
  async getLiveDashboardData(): Promise<ApiResponse<{
    matches: Match[];
    bets: Bet[];
    users: User[];
    stats: DashboardStats;
  }>> {
    return this.get('/dashboard/live');
  }

  /**
   * Get user-specific dashboard data
   */
  async getUserDashboardData(userId: string): Promise<ApiResponse<{
    user: User;
    recentBets: Bet[];
    recentMatches: Match[];
    stats: {
      totalBets: number;
      totalAmount: number;
      totalWins: number;
      totalLosses: number;
      winRate: number;
      currentBalance: number;
    };
  }>> {
    return this.get(`/dashboard/user/${userId}`);
  }

  /**
   * Get match-specific dashboard data
   */
  async getMatchDashboardData(matchId: string): Promise<ApiResponse<{
    match: Match;
    bets: Bet[];
    stats: {
      totalBets: number;
      totalAmount: number;
      totalWon: number;
      totalLost: number;
      pendingBets: number;
    };
  }>> {
    return this.get(`/dashboard/match/${matchId}`);
  }

  /**
   * Get betting trends data
   */
  async getBettingTrends(
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<{
    labels: string[];
    data: {
      totalBets: number[];
      totalAmount: number[];
      totalWins: number[];
      totalLosses: number[];
    };
  }>> {
    return this.get('/dashboard/betting-trends', { period });
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<{
    labels: string[];
    revenue: number[];
    profit: number[];
    loss: number[];
  }>> {
    return this.get('/dashboard/revenue', { period });
  }

  /**
   * Get user activity analytics
   */
  async getUserActivityAnalytics(
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<{
    labels: string[];
    activeUsers: number[];
    newUsers: number[];
    totalUsers: number[];
  }>> {
    return this.get('/dashboard/user-activity', { period });
  }

  /**
   * Get match performance analytics
   */
  async getMatchPerformanceAnalytics(
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<{
    labels: string[];
    totalMatches: number[];
    liveMatches: number[];
    completedMatches: number[];
  }>> {
    return this.get('/dashboard/match-performance', { period });
  }

  /**
   * Get top performing users
   */
  async getTopPerformingUsers(limit: number = 10): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/dashboard/top-users', { limit });
  }

  /**
   * Get top betting matches
   */
  async getTopBettingMatches(limit: number = 10): Promise<ApiResponse<Match[]>> {
    return this.get<Match[]>('/dashboard/top-matches', { limit });
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'critical';
    services: {
      database: 'up' | 'down';
      redis: 'up' | 'down';
      websocket: 'up' | 'down';
      externalApis: 'up' | 'down';
    };
    uptime: number;
    lastUpdate: string;
  }>> {
    return this.get('/dashboard/system-health');
  }
}
