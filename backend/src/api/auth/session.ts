import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    // Get token from cookie
    const authToken = req.cookies.betx_session;
    console.log('🔍 Session API: Checking for auth token');
    console.log('🔍 Session API: Request headers:', Object.keys(req.headers));
    console.log('🔍 Session API: Cookie header:', req.headers.cookie);
    console.log('🍪 All cookies:', req.cookies);
    console.log('🔑 Auth token found:', !!authToken, 'Length:', authToken?.length || 0);
    console.log('🔑 Auth token value:', authToken);

    if (!authToken) {
      console.log('❌ No auth token found in cookies');
      return res.status(401).json({ valid: false, message: 'No authentication token' });
    }
    
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
      console.log('✅ JWT token verified successfully');
    } catch (error) {
      console.log('❌ Invalid JWT token');
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }

    // Get user from database
    const userId = decoded.userId || decoded.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    // No isActive field in schema; skip

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
  } finally {
    await prisma.$disconnect();
  }
}
