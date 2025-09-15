// Authentication service for control-panel
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
      const response = await fetch(`${API_BASE_URL}/unified-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.status, response.statusText);
        return {
          success: false,
          message: `Login failed: ${response.status} ${response.statusText}`
        };
      }

      const data: LoginResponse = await response.json();

      if (data.success && data.user) {
        this.user = data.user;
        // Store token if provided, otherwise rely on cookie
        if (data.token) {
          this.token = data.token;
          this.saveToStorage(data.user, data.token);
        } else {
          // If no token in response, just save user data
          this.saveToStorage(data.user, '');
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
      console.log('🚪 Attempting server logout...');
      
      const response = await fetch(`${API_BASE_URL}/unified-logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Clear local state regardless of server response
      this.user = null;
      this.token = null;
      this.clearStorage();
      
      if (response.ok) {
        console.log('✅ Server logout successful');
        return true;
      } else {
        console.warn('⚠️ Server logout failed, but local state cleared');
        return true; // Still return true since we cleared local state
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state even if server call fails
      this.user = null;
      this.token = null;
      this.clearStorage();
      return true; // Return true since we cleared local state
    }
  }

  public async checkSession(): Promise<boolean> {
    // If we don't have any stored user data, don't make an API call
    // This prevents unnecessary 401 logs on first visit
    if (!this.user && !this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/unified-session-check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Session check failed:', response.status);
        this.user = null;
        this.token = null;
        this.clearStorage();
        return false;
      }

      const data = await response.json();

      if (data.success && data.valid && data.user) {
        this.user = data.user;
        // Don't save token from session check, use existing one
        if (this.token) {
          this.saveToStorage(data.user, this.token);
        }
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

  public isAuthenticated(): boolean {
    // For cookie-based auth, we mainly check if user exists
    // The actual session validation happens on the server
    return this.user !== null;
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

// Helper function to get role display name
export function getRoleDisplayName(role: string): string {
  const roleMap: { [key: string]: string } = {
    'OWNER': 'Owner',
    'SUB_OWN': 'Sub Owner',
    'SUP_ADM': 'Super Admin',
    'ADMIN': 'Admin',
    'SUB_ADM': 'Sub Admin',
    'MAS_AGENT': 'Master Agent',
    'SUP_AGENT': 'Super Agent',
    'AGENT': 'Agent',
    'USER': 'User'
  };
  
  return roleMap[role] || role;
}
