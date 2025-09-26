import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { sign, SignOptions } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userCommissionShare: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username. Please check your username and try again.' 
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not a valid user. Your account is inactive. Please contact administrator.' 
      });
    }

    // Verify password (stored in plain text for now)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Wrong password. Please check your password and try again.' 
      });
    }

    // Create JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status
      }
    };
    const expiresInConfig = (process.env.JWT_EXPIRES_IN ?? '24h') as unknown as number; // allow string like '24h'
    const options: SignOptions = {
      expiresIn: expiresInConfig as any,
      issuer: process.env.JWT_ISSUER || undefined,
      audience: process.env.JWT_AUDIENCE || undefined
    };
    const token = sign(payload, JWT_SECRET as string, options);

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `betx_session=${token}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
    ]);

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
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}