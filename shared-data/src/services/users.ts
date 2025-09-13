import { apiService, ApiResponse } from './api';
import { UserStats } from './dashboard';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUB_OWNER' | 'AGENT' | 'USER';
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  code: string;
  contactno: string;
  parentId?: string;
  parent?: {
    username: string;
    name: string;
  };
  userCommissionShare?: {
    share: number;
    available_share_percent: number;
    cshare: number;
    icshare: number;
    casinocommission: number;
    matchcommission: number;
    sessioncommission: number;
    sessionCommission: number;
    session_commission_type: string;
    commissionType: string;
  };
}

export interface UserFilters {
  role?: string;
  parentId?: string;
  status?: string;
  isActive?: boolean;
  excludeInactiveParents?: boolean;
  limit?: number;
  offset?: number;
}

export interface UsersResponse {
  users: User[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}


export class UserService {
  async getUsers(filters: UserFilters = {}): Promise<ApiResponse<UsersResponse>> {
    return apiService.get<UsersResponse>('/api/users', filters);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(`/api/users/${id}`);
  }

  async getUsersByRole(role: string): Promise<ApiResponse<UsersResponse>> {
    return apiService.get<UsersResponse>(`/api/users/by-role/${role}`);
  }

  async createUser(userData: {
    username: string;
    name: string;
    role: string;
    creditLimit: number;
    contactno: string;
    parentId?: string;
  }): Promise<ApiResponse<User>> {
    return apiService.post<User>('/api/users', userData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/api/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<{ message: string }>(`/api/users/${id}`);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/api/users/${id}/status`, { isActive });
  }

  async updateUserLimit(id: string, creditLimit: number): Promise<ApiResponse<User>> {
    return apiService.put<User>(`/api/users/${id}/limit`, { creditLimit });
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiService.get<UserStats>('/api/users/stats');
  }
}

export const userService = new UserService();
