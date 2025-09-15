'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = await authService.checkSession();
        if (isAuthenticated) {
          setUser(authService.getUser());
        }
        // If not authenticated, that's normal - user needs to login
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't treat this as an error - just means no session exists
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    if (result.success) {
      setUser(authService.getUser());
    }
    return result;
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🚪 Starting logout process...');
      
      // Call the auth service logout
      const success = await authService.logout();
      
      if (success) {
        console.log('✅ Logout successful');
        setUser(null);
        
        // Optional: Show a brief success message
        // You could add a toast notification here if you have one
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      } else {
        console.error('❌ Logout failed');
        // Even if server logout fails, clear local state
        setUser(null);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local state even if there's an error
      setUser(null);
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const checkSession = async () => {
    const isAuthenticated = await authService.checkSession();
    if (isAuthenticated) {
      setUser(authService.getUser());
    } else {
      setUser(null);
    }
    return isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isLoggingOut,
      login,
      logout,
      checkSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
