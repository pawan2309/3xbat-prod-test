import { BaseApiService } from './BaseApiService';
import { User, ApiResponse, FilterOptions, UserStats } from '../types';

export class UserService extends BaseApiService {
  constructor(baseURL?: string) {
    super(baseURL);
  }

  /**
   * Get all users with optional filtering
   */
  async getUsers(filters?: FilterOptions): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', filters);
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/users/${userId}`);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>('/users/me');
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    username: string;
    email: string;
    name: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    return this.post<User>('/users', userData);
  }

  /**
   * Update user information
   */
  async updateUser(
    userId: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${userId}`, userData);
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    status: string
  ): Promise<ApiResponse<User>> {
    return this.patch<User>(`/users/${userId}/status`, { status });
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    role: string
  ): Promise<ApiResponse<User>> {
    return this.patch<User>(`/users/${userId}/role`, { role });
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/users/${userId}`);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', { role });
  }

  /**
   * Get active users
   */
  async getActiveUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', { status: 'ACTIVE' });
  }

  /**
   * Get suspended users
   */
  async getSuspendedUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', { status: 'SUSPENDED' });
  }

  /**
   * Search users by username, name, or email
   */
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', { search: query });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    return this.get<UserStats>(`/users/${userId}/stats`);
  }

  /**
   * Get all users statistics
   */
  async getAllUsersStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    suspended: number;
    totalBalance: number;
    totalBets: number;
  }>> {
    return this.get('/users/stats');
  }

  /**
   * Get users with their associated matches and bets
   */
  async getUsersWithDetails(filters?: FilterOptions): Promise<ApiResponse<{
    users: User[];
    userMatches: Record<string, any[]>;
    userBets: Record<string, any[]>;
  }>> {
    return this.get('/users/with-details', filters);
  }

  /**
   * Get user hierarchy (for agents and super agents)
   */
  async getUserHierarchy(userId: string): Promise<ApiResponse<{
    user: User;
    subordinates: User[];
    parent?: User;
  }>> {
    return this.get(`/users/${userId}/hierarchy`);
  }

  /**
   * Update user balance
   */
  async updateUserBalance(
    userId: string,
    amount: number,
    type: 'ADD' | 'SUBTRACT' | 'SET'
  ): Promise<ApiResponse<User>> {
    return this.patch<User>(`/users/${userId}/balance`, { amount, type });
  }

  /**
   * Get users by risk level
   */
  async getUsersByRiskLevel(riskLevel: string): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', { riskLevel });
  }

  /**
   * Get users by registration date range
   */
  async getUsersByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/users', {
      dateFrom: startDate,
      dateTo: endDate,
    });
  }
}
