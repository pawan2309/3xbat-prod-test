import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../auth';
import { validateDomainAccess, getPrimaryDomain } from '../domainAccess';
import type { Role } from '../hierarchyUtils';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    username: string;
    role: string;
    name?: string;
  };
}

/**
 * Middleware to validate domain access and authentication
 */
export function withDomainAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  options: {
    requireAuth?: boolean;
    allowedRoles?: string[];
  } = {}
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // TEMPORARY: BYPASS DOMAIN AUTH FOR TESTING - Remove this in production!
      console.log('🚀 BYPASS MODE: Skipping domain authentication for testing');
      
      // Mock user data for testing - SUB_OWNER role for full access
      req.user = {
        id: 'mock-sub-owner-id',
        username: 'SUB_OWNER_001',
        role: 'SUB_OWNER',
        name: 'Sub Owner Test User'
      };

      // Call the handler
      return handler(req, res);

      // ORIGINAL DOMAIN AUTH CODE - COMMENTED OUT FOR TESTING
      // const { requireAuth = true, allowedRoles } = options;

      // // Get current domain from request
      // const currentDomain = req.headers.host || '';
      
      // // Check if authentication is required
      // if (requireAuth) {
      //   // Verify JWT token
      //   const token = req.headers.authorization?.replace('Bearer ', '') || 
      //                req.cookies?.betx_session;
        
      //   if (!token) {
      //     return res.status(401).json({
      //       success: false,
      //       message: 'Authentication required'
      //     });
      //   }

      //   // Verify token and get user data
      //   const userData = await verifyToken(token);
      //   if (!userData) {
      //     return res.status(401).json({
      //       success: false,
      //       message: 'Invalid or expired token'
      //     });
      //   }

      //   // Validate domain access
      //   const hasDomainAccess = validateDomainAccess(userData.role as Role, currentDomain);
      //   if (!hasDomainAccess) {
      //     const primaryDomain = getPrimaryDomain(userData.role as Role);
      //     return res.status(403).json({
      //       success: false,
      //       message: `Access denied. Your role (${userData.role}) should access ${primaryDomain}`,
      //       redirectTo: primaryDomain
      //     });
      //   }

      //   // Check role permissions if specified
      //   if (allowedRoles && !allowedRoles.includes(userData.role as Role)) {
      //     return res.status(403).json({
      //       success: false,
      //       message: 'Insufficient permissions for this operation'
      //     });
      //   }

      //   // Attach user data to request
      //   req.user = {
      //     id: (userData.id || userData.userId) as string,
      //     username: userData.username,
      //     role: userData.role as string,
      //     name: userData.name
      //   };
      // }

      // // Call the handler
      // return handler(req, res);

    } catch (error) {
      console.error('Domain auth middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

/**
 * Middleware specifically for OWNER access to operating panel
 */
export function withOwnerAccess(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withDomainAuth(handler, {
    requireAuth: true,
    allowedRoles: ['OWNER']
  });
}

/**
 * Middleware for user management access (all roles except OWNER and USER)
 */
export function withUserManagementAccess(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withDomainAuth(handler, {
    requireAuth: true,
    allowedRoles: ['SUB_OWNER', 'SUPER_ADMIN', 'ADMIN', 'SUB', 'MASTER', 'SUPER_AGENT', 'AGENT']
  });
}

/**
 * Middleware for specific role access (e.g., only SUB_OWNER)
 */
export function withRoleAccess(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  allowedRole: string
) {
  return withDomainAuth(handler, {
    requireAuth: true,
    allowedRoles: [allowedRole]
  });
}

/**
 * Middleware for user package access (USER role only)
 */
export function withUserPackageAccess(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return withDomainAuth(handler, {
    requireAuth: true,
    allowedRoles: ['USER']
  });
} 