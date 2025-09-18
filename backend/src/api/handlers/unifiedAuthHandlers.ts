import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { getRoleBasedNavigation, canAccessFeature, getAccessibleRoles } from '../../shared/utils/roleHierarchy';
import { getPrimaryDomain, shouldRedirect } from '../../shared/utils/domainAccess';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Unified login handler for all panels
export const unifiedLogin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        username: username
      },
      include: {
        userCommissionShare: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password (temporarily using plain text for existing users)
    // TODO: Implement proper password hashing for new users
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status
      }
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Get role-based navigation and permissions
    const navigation = getRoleBasedNavigation(user.role);
    const accessibleRoles = getAccessibleRoles(user.role);
    
    // Check domain redirection (only in production)
    const currentDomain = req.get('host') || '';
    const redirectInfo = process.env.NODE_ENV === 'production' 
      ? shouldRedirect(user.role as any, currentDomain)
      : { shouldRedirect: false, targetDomain: currentDomain };

    // Set HTTP-only cookie (only once)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      // Don't set domain in development to allow localhost cookies
      ...(process.env.NODE_ENV === 'production' && { domain: '.3xbat.com' })
    };
    
    console.log('🍪 Setting cookie with options:', cookieOptions);
    console.log('🍪 Request host:', req.get('host'));
    console.log('🍪 Request origin:', req.get('origin'));
    
    res.cookie('betx_session', token, cookieOptions);
    console.log('🍪 Cookie set successfully');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        limit: user.limit,
        contactno: user.contactno,
        userCommissionShare: user.userCommissionShare
      },
      token,
      navigation,
      accessibleRoles,
      redirectInfo
    });

  } catch (error) {
    console.error('Unified login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Unified logout handler for all panels
export const unifiedLogout = async (req: Request, res: Response) => {
  try {
    // Get user info from token before clearing (for logging)
    let userInfo: { username: string; role: string } | null = null;
    try {
      const authToken = req.cookies.betx_session;
      if (authToken) {
        const decoded = jwt.verify(authToken, JWT_SECRET) as any;
        userInfo = decoded.user;
      }
    } catch (error) {
      // Token might be invalid, but we still want to clear the cookie
      console.log('Token verification failed during logout:', error);
    }

    // Clear the session cookie with multiple path options to ensure complete cleanup
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Immediately expire the cookie
      // Don't set domain in development to allow localhost cookies
      ...(process.env.NODE_ENV === 'production' && { domain: '.3xbat.com' })
    };

    console.log('🍪 Clearing session cookie with options:', clearCookieOptions);
    res.clearCookie('betx_session', clearCookieOptions);

    // Also clear any potential variations of the cookie
    res.clearCookie('betx_session', {
      ...clearCookieOptions,
      sameSite: 'strict' as const
    });

    // Clear with different path variations
    res.clearCookie('betx_session', {
      ...clearCookieOptions,
      path: '/api'
    });

    // Set an empty cookie to ensure it's cleared
    res.cookie('betx_session', '', {
      ...clearCookieOptions,
      expires: new Date(0)
    });

    // Log logout event
    if (userInfo) {
      console.log(`🚪 User ${userInfo.username} (${userInfo.role}) logged out from ${req.get('host') || 'unknown'}`);
    } else {
      console.log('🚪 Anonymous logout request from', req.get('host') || 'unknown');
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unified logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

// Unified session check handler
export const unifiedSessionCheck = async (req: Request, res: Response) => {
  try {
    const authToken = req.cookies.betx_session;
    console.log('🔍 Session check: Auth token present:', !!authToken);

    if (!authToken) {
      console.log('🔍 Session check: No auth token found');
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'No authentication token'
      });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from database to ensure they still exist and are active
    const userId = decoded.user?.id || decoded.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCommissionShare: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Account is inactive'
      });
    }

    // Get role-based navigation and permissions
    console.log('🔍 Getting navigation for role:', user.role);
    const navigation = getRoleBasedNavigation(user.role);
    const accessibleRoles = getAccessibleRoles(user.role);

    return res.status(200).json({
      success: true,
      valid: true,
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        limit: user.limit,
        contactno: user.contactno,
        userCommissionShare: user.userCommissionShare
      },
      navigation,
      accessibleRoles
    });

  } catch (error) {
    console.error('Unified session check error:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Internal server error'
    });
  }
};

// Role access handler
export const unifiedRoleAccess = async (req: Request, res: Response) => {
  try {
    const authToken = req.cookies.betx_session;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token'
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

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Get role-based access information
    const navigation = getRoleBasedNavigation(user.role);
    const accessibleRoles = getAccessibleRoles(user.role);
    
    // Build feature access object
    const featureAccess: Record<string, boolean> = {};
    const features = [
      'login_reports',
      'super_admin_management',
      'admin_management',
      'sub_owner_management',
      'sub_management',
      'master_management',
      'super_agent_management',
      'agent_management',
      'client_management'
    ];

    features.forEach(feature => {
      featureAccess[feature] = canAccessFeature(user.role, feature);
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      access: {
        accessibleRoles,
        navigation,
        featureAccess,
        accessibleUsersByRole: {} // This would be populated based on specific needs
      }
    });

  } catch (error) {
    console.error('Unified role access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
