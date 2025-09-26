import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// POST /api/auth/login - User login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userCommissionShare: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username. Please check your username and try again.' });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Not a valid user. Your account is inactive. Please contact administrator.' });
    }

    // Verify password (plain text comparison)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Wrong password. Please check your password and try again.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status
        }
      },
      JWT_SECRET,
      { 
        expiresIn: '24h'
      }
    );

    // Set cookie
    res.cookie('betx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log('✅ Login successful for user:', user.username, 'Role:', user.role);

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
        casinoStatus: user.casinoStatus,
        userCommissionShare: user.userCommissionShare
      },
      token
    });

    // ORIGINAL LOGIN CODE - COMMENTED OUT FOR TESTING
    // // Find user by username
    // const user = await prisma.user.findUnique({
    //   where: { username },
    //   include: {
    //     UserCommissionShare: true
    //   }
    // });

    // if (!user) {
    //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
    // }

    // // Check password (stored in plain text for credential sharing)
    // if (user.password !== password) {
    //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
    // }

    // // Check if user is active
    // if (!user.isActive) {
    //   return res.status(401).json({ success: false, message: 'Account is deactivated' });
    // }

    // // Generate JWT token
    // const token = jwt.sign(
    //   { 
    //     user: {
    //       id: user.id,
    //       username: user.username,
    //       name: user.name,
    //       role: user.role
    //     },
    //     userId: user.id,
    //     id: user.id,
    //     username: user.username,
    //     role: user.role
    //   },
    //   JWT_SECRET,
    //   { expiresIn: '24h' }
    // );

    // // Set cookie
    // res.cookie('betx_session', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 24 * 60 * 60 * 1000 // 24 hours
    // });

    // return res.status(200).json({
    //   success: true,
    //   message: 'Login successful',
    //   user: {
    //     id: user.id,
    //     username: user.username,
    //     name: user.name,
    //     role: user.role
    //   },
    //   token
    // });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/logout - User logout
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the session cookie
    res.clearCookie('betx_session');
    
    return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/unified-session-check - Get current session
export const getSession = async (req: Request, res: Response) => {
  try {
    // Get token from cookie
    const authToken = req.cookies.betx_session;
    console.log('🔍 Session API: Checking for auth token');

    if (!authToken) {
      console.log('❌ No auth token found in cookies');
      return res.status(401).json({ valid: false, message: 'No authentication token' });
    }
    
    console.log('🔍 Token content (first 20 chars):', authToken.substring(0, 20) + '...');

    // Verify JWT token
    let decoded: any;
    try {
      console.log('🔍 Verifying JWT token...');
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET environment variable not set');
        return res.status(500).json({ valid: false, message: 'Server configuration error' });
      }
      
      decoded = jwt.verify(authToken, JWT_SECRET);
      console.log('✅ JWT token verified successfully:', {
        userId: decoded.user?.id || decoded.userId,
        username: decoded.user?.username || decoded.username,
        role: decoded.user?.role || decoded.role
      });
    } catch (error) {
      console.log('❌ Invalid JWT token:', error);
      return res.status(401).json({ valid: false, message: 'Invalid token' });
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
      console.log('❌ User not found for token');
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    // Check if user is still active
    if (user.status !== 'ACTIVE') {
      console.log('❌ User account not active:', user.username);
      return res.status(401).json({ valid: false, message: 'Account not active' });
    }

    console.log('✅ Valid session for user:', user.username, 'Role:', user.role);

    // Return user session data
    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('💥 Session validation error:', error);
    return res.status(500).json({ valid: false, message: 'Internal server error' });
  }
};

// GET /api/auth/profile - Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Get session from cookie
    const session = req.cookies['betx_session'];
    if (!session) {
      return res.status(401).json({ success: false, message: 'No session found' });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(session, JWT_SECRET) as any;
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    const userId = decoded.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found in session' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCommissionShare: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        limit: user.limit,
        casinoStatus: user.casinoStatus,
        contactno: user.contactno,
        createdAt: user.createdAt,
        reference: user.reference,
        userCommissionShare: user.userCommissionShare
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/refresh - Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get current token from cookie
    const currentToken = req.cookies.betx_session;
    
    if (!currentToken) {
      return res.status(401).json({ success: false, message: 'No token to refresh' });
    }

    // Verify current token
    let decoded: any;
    try {
      decoded = jwt.verify(currentToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Get user from database to ensure they still exist and are active
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
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status
        }
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set new cookie
    res.cookie('betx_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ success: true, token: newToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/role-access - Get role access
export const getRoleAccess = async (req: Request, res: Response) => {
  try {
    // Get token from cookie
    const authToken = req.cookies.betx_session;
    
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'No authentication token' });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userRole = decoded.user?.role || decoded.role;
    
    // Define role hierarchy and permissions (1 = highest authority)
    const roleHierarchy: Record<string, {
      level: number;
      accessibleRoles: string[];
      permissions: string[];
    }> = {
      'OWNER': {
        level: 1,
        accessibleRoles: [], // OWNER restricted to control panel only
        permissions: ['control_panel_only']
      },
      'SUB_OWN': {
        level: 2,
        accessibleRoles: ['SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
        permissions: ['user_management', 'limit_management', 'commission_management', 'reporting', 'admin_panel']
      },
      'SUP_ADM': {
        level: 3,
        accessibleRoles: ['SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
        permissions: ['user_management', 'limit_management', 'commission_management', 'reporting']
      },
      'ADMIN': {
        level: 4,
        accessibleRoles: ['ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
        permissions: ['user_management', 'limit_management', 'reporting']
      },
      'SUB_ADM': {
        level: 5,
        accessibleRoles: ['SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
        permissions: ['user_management', 'reporting']
      },
      'MAS_AGENT': {
        level: 6,
        accessibleRoles: ['MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
        permissions: ['user_management']
      },
      'SUP_AGENT': {
        level: 7,
        accessibleRoles: ['SUP_AGENT', 'AGENT', 'USER'],
        permissions: ['user_management']
      },
      'AGENT': {
        level: 8,
        accessibleRoles: ['AGENT', 'USER'],
        permissions: ['user_management']
      },
      'USER': {
        level: 9,
        accessibleRoles: ['USER'], // USER can only access their own data
        permissions: ['own_data_only']
      }
    };

    const roleAccess = roleHierarchy[userRole as keyof typeof roleHierarchy] || roleHierarchy['USER'];

    return res.status(200).json({ 
      success: true, 
      roleAccess: {
        canAccessAll: roleAccess.permissions.includes('all'),
        accessibleRoles: roleAccess.accessibleRoles,
        permissions: roleAccess.permissions,
        userRole: userRole,
        level: roleAccess.level
      }
    });
  } catch (error) {
    console.error('Role access error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
