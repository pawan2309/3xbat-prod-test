// Authentication service for client-panels
import { config } from './config';

const API_BASE_URL = config.authApiUrl;

export interface User {
  id: string;
  username: string;
  name: string | null;
  role: string;
  status: string;
  limit: number;
  contactno: string | null;
  userCommissionShare: any;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  navigation?: any;
  accessibleRoles?: string[];
  redirectInfo?: {
    shouldRedirect: boolean;
    targetDomain: string;
  };
}

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private token: string | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const tokenStr = localStorage.getItem('token');
      
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
      if (tokenStr) {
        this.token = tokenStr;
      }
    }
  }

  private saveToStorage(user: User, token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
  }

  private clearStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  public async login(username: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Making login request to:', `${API_BASE_URL}/unified-login`); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/unified-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status); // Debug log
      const data: LoginResponse = await response.json();
      console.log('Login response data:', data); // Debug log

      if (data.success && data.user && data.token) {
        console.log('Saving user data to storage'); // Debug log
        this.user = data.user;
        this.token = data.token;
        this.saveToStorage(data.user, data.token);
        console.log('User data saved, user:', this.user?.username); // Debug log
        
        // Also set a flag to indicate successful login
        if (typeof window !== 'undefined') {
          localStorage.setItem('login_success', 'true');
        }
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  public async logout(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/unified-logout`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      });

      this.user = null;
      this.token = null;
      this.clearStorage();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if server call fails
      this.user = null;
      this.token = null;
      this.clearStorage();
      return true;
    }
  }

  public async checkSession(): Promise<boolean> {
    try {
      console.log('Checking session...'); // Debug log
      const response = await fetch(`${API_BASE_URL}/unified-session-check`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });

      console.log('Session check response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Session check response data:', data); // Debug log

      if (data.success && data.valid && data.user) {
        console.log('Session valid, user:', data.user.username); // Debug log
        this.user = data.user;
        this.saveToStorage(data.user, this.token || '');
        return true;
      } else {
        console.log('Session invalid, clearing storage'); // Debug log
        this.user = null;
        this.token = null;
        this.clearStorage();
        return false;
      }
    } catch (error) {
      console.error('Session check error:', error);
      this.user = null;
      this.token = null;
      this.clearStorage();
      return false;
    }
  }

  public isAuthenticated(): boolean {
    return this.user !== null && this.token !== null;
  }

  public getUser(): User | null {
    return this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  public hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }
}

export const authService = AuthService.getInstance();
