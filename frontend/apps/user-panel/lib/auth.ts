// Authentication service for user-panel
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth`
  : 'http://localhost:4000/api/auth';

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
      const response = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user && data.token) {
        this.user = data.user;
        this.token = data.token;
        this.saveToStorage(data.user, data.token);
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
      await fetch('/api/auth/unified-logout', {
        method: 'POST',
        credentials: 'include',
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
      const response = await fetch('/api/auth/unified-session-check', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.valid && data.user) {
        this.user = data.user;
        this.saveToStorage(data.user, this.token || '');
        return true;
      } else {
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

  // Helper method to get session data from backend
  public async getSessionData(): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch('/api/auth/unified-session-check', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.valid && data.user) {
        this.user = data.user;
        this.saveToStorage(data.user, this.token || '');
        return { success: true, user: data.user };
      } else {
        this.user = null;
        this.token = null;
        this.clearStorage();
        return { success: false, message: data.message || 'Session invalid' };
      }
    } catch (error) {
      console.error('Session data fetch error:', error);
      this.user = null;
      this.token = null;
      this.clearStorage();
      return { success: false, message: 'Network error' };
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

// Helper function for API routes
export async function verifyToken(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch('http://localhost:5000/api/auth/unified-session-check', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success && data.valid && data.user) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: 'Invalid token' };
    }
  } catch (error) {
    return { success: false, error: 'Token verification failed' };
  }
}
