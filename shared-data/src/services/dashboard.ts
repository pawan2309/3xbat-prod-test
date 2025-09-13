import { apiService, ApiResponse } from './api';

export interface DashboardStats {
  totalMatches: number;
  activeMatches: number;
  totalBets: number;
  totalUsers: number;
  totalStake: number;
  totalWinnings: number;
  pendingBets: number;
  todayBets: number;
  todayWinnings: number;
  winRate: number;
}

export interface MatchStats {
  totalMatches: number;
  liveMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  upcomingMatches: number;
}

export interface BetStats {
  totalBets: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  totalStake: number;
  totalWinnings: number;
  winRate: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: Record<string, number>;
}

export class DashboardService {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiService.get<DashboardStats>('/api/dashboard/stats');
  }

  async getMatchStats(): Promise<ApiResponse<MatchStats>> {
    return apiService.get<MatchStats>('/api/dashboard/match-stats');
  }

  async getBetStats(): Promise<ApiResponse<BetStats>> {
    return apiService.get<BetStats>('/api/dashboard/bet-stats');
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiService.get<UserStats>('/api/dashboard/user-stats');
  }

  async getRecentActivity(limit: number = 10): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>('/api/dashboard/recent-activity', { limit });
  }
}

export const dashboardService = new DashboardService();
