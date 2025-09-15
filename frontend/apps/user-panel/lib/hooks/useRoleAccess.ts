import { useState, useEffect } from 'react';
import { authService } from '../auth';
import { Role } from '../types';

export interface RoleAccess {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  accessibleRoles: Role[];
  userRole: Role;
}

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

export function useRoleAccess() {
  const [roleAccess, setRoleAccess] = useState<RoleAccess | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const isAuthenticated = await authService.checkSession();
        
        if (isAuthenticated) {
          const currentUser = authService.getUser();
          if (currentUser) {
            setUser(currentUser);
            const userRole = currentUser.role as Role;
            
            // Define role-based permissions
            const permissions = getRolePermissions(userRole);
            
            setRoleAccess({
              ...permissions,
              userRole,
            });
          }
        }
      } catch (error) {
        console.error('Role access check error:', error);
        setError('Failed to check role access');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  const canAccess = (requiredRoles: Role[]): boolean => {
    if (!roleAccess) return false;
    return requiredRoles.includes(roleAccess.userRole);
  };

  return { 
    roleAccess, 
    user, 
    canAccess, 
    loading, 
    error 
  };
}

function getRolePermissions(role: Role): Omit<RoleAccess, 'userRole'> {
  const roleHierarchy: Record<Role, number> = {
    'OWNER': 9,
    'SUB_OWN': 8,
    'SUP_ADM': 7,
    'ADMIN': 6,
    'SUB_ADM': 5,
    'MAS_AGENT': 4,
    'SUP_AGENT': 3,
    'AGENT': 2,
    'USER': 1,
  };

  const userLevel = roleHierarchy[role] || 0;

  // Define accessible roles based on hierarchy
  const accessibleRoles: Role[] = Object.entries(roleHierarchy)
    .filter(([_, level]) => level < userLevel)
    .map(([roleName, _]) => roleName as Role);

  return {
    canCreate: userLevel >= 2, // AGENT and above can create
    canEdit: userLevel >= 2,   // AGENT and above can edit
    canDelete: userLevel >= 4, // MAS_AGENT and above can delete
    canView: true,             // All roles can view
    accessibleRoles,
  };
}
