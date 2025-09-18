'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if user is already authenticated locally
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true);
          setAuthChecked(true);
          setIsLoading(false);
          return;
        }

        // If not authenticated locally, check with server
        const authenticated = await authService.checkSession();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          console.log('User not authenticated, redirecting to login');
          // Store the current path to redirect back after login
          if (pathname && pathname !== '/login') {
            localStorage.setItem('redirectAfterLogin', pathname);
          }
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Store the current path to redirect back after login
        if (pathname && pathname !== '/login') {
          localStorage.setItem('redirectAfterLogin', pathname);
        }
        router.push('/login');
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Verifying authentication...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we check your session</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect to login)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
