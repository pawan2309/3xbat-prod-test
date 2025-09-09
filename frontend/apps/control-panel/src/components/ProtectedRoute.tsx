import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();

  // In demo mode, always allow access
  // In production, you would check authentication here
  const isDemoMode = true; // Set to false in production

  useEffect(() => {
    if (!isDemoMode) {
      // Add your authentication logic here for production
      // For now, we'll skip authentication in demo mode
    }
  }, [isDemoMode]);

  // In demo mode, always render children
  if (isDemoMode) {
    return <>{children}</>;
  }

  // Production authentication logic would go here
  return <>{children}</>;
}

// Helper function to check role permissions
function hasRolePermission(userRole: string, requiredRole: string): boolean {
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
