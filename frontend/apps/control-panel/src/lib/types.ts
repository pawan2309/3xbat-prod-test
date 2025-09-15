// Type definitions for the control panel

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  status: string;
  limit: number;
  casinoStatus: boolean;
  isActive?: boolean;
  creditLimit?: number;
}

export interface Match {
  id: string;
  name: string;
  status: string;
  isVisible: boolean;
  startTime: string;
  endTime?: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  matchId: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  match?: Match;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  activeMatches: number;
  totalBets: number;
  totalVolume: number;
  pendingBets: number;
  completedBets: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  error?: string;
}

export interface FilterOptions {
  role?: string;
  isActive?: boolean;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}
