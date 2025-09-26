import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        name: string | null;
        role: string;
        status: string;
      };
    }
  }
}

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie
    const authToken = req.cookies.betx_session;
    
    if (!authToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      });
    }

    // Verify JWT token
    let decoded: any;














    
    
    
    
    
    try {
      decoded = jwt.verify(authToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Get user from database
    const userId = decoded.user?.id || decoded.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is still active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is inactive' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Role-based authorization middleware
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Role hierarchy with clear descriptions (highest to lowest authority)
const roleHierarchy = [
  'OWNER',          // Level 1: Owner (highest authority)
  'SUB_OWN',        // Level 2: Sub-owner
  'SUP_ADM',        // Level 3: Super administrator
  'ADMIN',          // Level 4: Administrator
  'SUB_ADM',        // Level 5: Sub-administrator
  'MAS_AGENT',      // Level 6: Master agent
  'SUP_AGENT',      // Level 7: Super agent
  'AGENT',          // Level 8: Agent
  'USER'            // Level 9: User (lowest level)
];

// Role descriptions for better understanding
export const roleDescriptions = {
  'USER': 'End users/players - Can place bets and view their own data',
  'AGENT': 'Basic agents - Can manage users and view basic reports',
  'SUP_AGENT': 'Super agents - Can manage agents and view advanced reports',
  'MAS_AGENT': 'Master agents - Can manage super agents and access master-level features',
  'SUB_ADM': 'Sub-administrators - Can manage masters and access sub-admin features',
  'ADMIN': 'Administrators - Can manage subs and access admin features',
  'SUP_ADM': 'Super administrators - Can manage admins and access super admin features',
  'SUB_OWN': 'Sub-owners - Can manage super admins and access sub-owner features',
  'OWNER': 'Owner - Highest level, can manage all users and access all features'
};

// Check if user has permission for a specific role
// Lower index = higher authority, so user can access roles with higher or equal index
export const hasRolePermission = (userRole: string, requiredRole: string): boolean => {
  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  
  // User can access roles that are at their level or lower (higher index)
  return userIndex <= requiredIndex;
};

// Get role level (1-9, where 1 is highest authority)
export const getRoleLevel = (role: string): number => {
  return roleHierarchy.indexOf(role) + 1;
};

// Get role description
export const getRoleDescription = (role: string): string => {
  return roleDescriptions[role as keyof typeof roleDescriptions] || 'Unknown role';
};

// Middleware to check if user can access specific role
export const canAccessRole = (targetRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!hasRolePermission(req.user.role, targetRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Insufficient permissions to access ${targetRole} level` 
      });
    }

    next();
  };
};
