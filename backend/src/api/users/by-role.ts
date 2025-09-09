import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { role } = req.query;

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ success: false, message: 'Role parameter is required' });
    }

    const users = await prisma.user.findMany({
      where: {
        role: role as any
      },
      select: {
        id: true,
        username: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json({ 
      success: true, 
      users: users.map(user => ({
        id: user.id,
        label: `${user.name || user.username}`,
        value: user.id,
        username: user.username,
        name: user.name
      }))
    });

  } catch (error) {
    console.error('Error fetching users by role:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users', 
      error: (error as Error).message 
    });
  }
} 