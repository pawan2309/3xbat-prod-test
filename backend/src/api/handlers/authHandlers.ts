import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'L9vY7z!pQkR#eA1dT3u*Xj5@FbNmC2Ws';

// POST /api/auth/login - User login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // TEMPORARY: BYPASS LOGIN FOR TESTING - Remove this in production!
    console.log('🚀 BYPASS MODE: Skipping login validation for testing');
    
    // Mock user data for testing - SUB_OWNER role for full access
    const mockUser = {
      id: 'mock-sub-owner-id',
      username: 'SUB_OWNER_001',
      name: 'Sub Owner Test User',
      role: 'SUB_OWNER',
      isActive: true
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        user: mockUser,
        userId: mockUser.id,
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('betx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log('✅ Mock login successful for user:', mockUser.username, 'Role:', mockUser.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful (BYPASS MODE)',
      user: mockUser,
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

// GET /api/auth/session - Get current session
export const getSession = async (req: Request, res: Response) => {
  try {
    // TEMPORARY: BYPASS SESSION VALIDATION FOR TESTING - Remove this in production!
    console.log('🚀 BYPASS MODE: Skipping session validation for testing');
    
    // Mock user session data for testing - SUB_OWNER role for full access
    const mockUser = {
      id: 'mock-sub-owner-id',
      username: 'SUB_OWNER_001',
      name: 'Sub Owner Test User',
      role: 'SUB_OWNER',
      isActive: true
    };

    console.log('✅ Mock session for user:', mockUser.username, 'Role:', mockUser.role);

    // Return mock user session data
    return res.status(200).json({
      valid: true,
      user: {
        id: mockUser.id,
        username: mockUser.username,
        name: mockUser.name,
        role: mockUser.role
      }
    });

    // ORIGINAL SESSION VALIDATION CODE - COMMENTED OUT FOR TESTING
    // // Get token from cookie
    // const authToken = req.cookies.betx_session;
    // console.log('🔍 Session API: Checking for auth token');
    // console.log('🔍 Session API: Request headers:', Object.keys(req.headers));
    // console.log('🔍 Session API: Cookie header:', req.headers.cookie);
    // console.log('🍪 All cookies:', req.cookies);
    // console.log('🔑 Auth token found:', !!authToken, 'Length:', authToken?.length || 0);
    // console.log('🔑 Auth token value:', authToken);

    // if (!authToken) {
    //   console.log('❌ No auth token found in cookies');
    //   return res.status(401).json({ valid: false, message: 'No authentication token' });
    // }
    
    // console.log('🔍 Token content (first 20 chars):', authToken.substring(0, 20) + '...');

    // // Verify JWT token
    // let decoded: any;
    // try {
    //   console.log('🔍 Verifying JWT token...');
    //   const JWT_SECRET = process.env.JWT_SECRET;
    //   if (!JWT_SECRET) {
    //     console.error('❌ JWT_SECRET environment variable not set');
    //     return res.status(500).json({ valid: false, message: 'Server configuration error' });
    //   }
      
    //   console.log('🔍 Session API: Using JWT secret from env');
    //   console.log('🔍 Session API: Token to verify:', authToken.substring(0, 30) + '...');
    //   console.log('🔍 Session API: Token length:', authToken.length);
    //   console.log('🔍 Session API: Token format check:', {
    //     hasDots: authToken.includes('.'),
    //     parts: authToken.split('.').length,
    //     firstPart: authToken.split('.')[0]?.substring(0, 10) + '...',
    //     secondPart: authToken.split('.')[1]?.substring(0, 10) + '...',
    //     thirdPart: authToken.split('.')[2]?.substring(0, 10) + '...'
    //   });
      
    //   decoded = jwt.verify(authToken, JWT_SECRET);
    //   console.log('✅ JWT token verified successfully:', {
    //     userId: decoded.userId,
    //     id: decoded.id,
    //     username: decoded.username,
    //     role: decoded.role
    //   });
    // } catch (error) {
    //   console.log('❌ Invalid JWT token:', error);
    //   console.log('❌ Token verification error details:', {
    //     name: error instanceof Error ? error.name : 'Unknown',
    //     message: error instanceof Error ? error.message : 'Unknown',
    //     stack: error instanceof Error ? error.stack : 'Unknown'
    //   });
      
    //   // Try to decode without verification to see the payload
    //   try {
    //     const unverifiedPayload = jwt.decode(authToken);
    //     console.log('🔍 Unverified payload:', unverifiedPayload);
    //   } catch (decodeError) {
    //     console.log('❌ Even decode failed:', decodeError);
    //   }
      
    //   return res.status(401).json({ valid: false, message: 'Invalid token' });
    // }

    // // Get user from database
    // const userId = decoded.userId || decoded.id;
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: {
    //     id: true,
    //     username: true,
    //     name: true,
    //     role: true,
    //     isActive: true
    //   }
    // });

    // if (!user) {
    //   console.log('❌ User not found for token');
    //   return res.status(401).json({ valid: false, message: 'User not found' });
    // }

    // // Check if user is still active
    // if (!user.isActive) {
    //   console.log('❌ User account not active:', user.username);
    //   return res.status(401).json({ valid: false, message: 'Account not active' });
    // }

    // console.log('✅ Valid session for user:', user.username, 'Role:', user.role);

    // // Return user session data
    // return res.status(200).json({
    //   valid: true,
    //   user: {
    //     id: user.id,
    //     username: user.username,
    //     name: user.name,
    //     role: user.role
    //   }
    // });

  } catch (error) {
    console.error('💥 Session validation error:', error);
    return res.status(500).json({ valid: false, message: 'Internal server error' });
  }
};

// GET /api/auth/profile - Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Mock profile data for testing
    const profile = {
      id: 'mock-sub-owner-id',
      username: 'SUB_OWNER_001',
      name: 'Sub Owner Test User',
      role: 'SUB_OWNER',
      isActive: true,
      creditLimit: 1000000,
      createdAt: new Date(),
      code: 'SUB_OWNER_001',
      contactno: '1234567890'
    };

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/refresh - Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Mock refresh for testing
    const mockUser = {
      id: 'mock-sub-owner-id',
      username: 'SUB_OWNER_001',
      name: 'Sub Owner Test User',
      role: 'SUB_OWNER',
      isActive: true
    };

    const token = jwt.sign(
      { 
        user: mockUser,
        userId: mockUser.id,
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('betx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/role-access - Get role access
export const getRoleAccess = async (req: Request, res: Response) => {
  try {
    // Mock role access for SUB_OWNER
    const roleAccess = {
      canAccessAll: true,
      accessibleRoles: ['OWNER', 'SUB_OWNER', 'SUPER_ADMIN', 'ADMIN', 'SUB', 'MASTER', 'SUPER_AGENT', 'AGENT', 'USER'],
      permissions: ['user_management', 'limit_management', 'commission_management', 'reporting', 'admin_panel']
    };

    return res.status(200).json({ success: true, roleAccess });
  } catch (error) {
    console.error('Role access error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
