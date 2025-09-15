import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'L9vY7z!pQkR#eA1dT3u*Xj5@FbNmC2Ws';

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

// Check if user has permission for a specific role
export const hasRolePermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = [
    'USER',
    'AGENT',
    'SUP_AGENT',
    'MAS_AGENT',
    'SUB_ADM',
    'ADMIN',
    'SUP_ADM',
    'SUB_OWN',
    'OWNER'
  ];

  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  
  return userIndex >= requiredIndex;
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
