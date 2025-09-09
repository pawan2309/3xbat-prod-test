import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get session from cookie
    const session = req.cookies['betx_session'];
    if (!session) {
      return res.status(401).json({ success: false, message: 'No session found' });
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

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
        userCommissionShare: user.userCommissionShare
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}