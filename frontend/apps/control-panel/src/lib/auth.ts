// Authentication utilities and API functions

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  status: string;
  limit: number;
  casinoStatus: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// API Base URL - Use the backend server directly (bypass Next.js rewrites)
const API_BASE_URL = 'http://localhost:4000';

// Login function
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
}

// Logout function
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.user || null;
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we have a session cookie
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith('betx_session=')
  );
  
  return !!sessionCookie;
}

// Get role display name
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'SUB_OWN': 'Sub Owner',
    'SUP_ADM': 'Super Admin',
    'ADMIN': 'Admin',
    'SUB_ADM': 'Sub Admin',
    'MAS_AGENT': 'Master Agent',
    'SUP_AGENT': 'Super Agent',
    'AGENT': 'Agent',
    'USER': 'User'
  };
  
  return roleNames[role] || role;
}

// Check if user has permission for a role
export function hasRolePermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = [
    'USER',
    'AGENT',
    'SUP_AGENT',
    'MAS_AGENT',
    'SUB_ADM',
    'ADMIN',
    'SUP_ADM',
    'SUB_OWN'
  ];

  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  
  return userIndex >= requiredIndex;
}
