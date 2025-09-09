import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { getAccessibleRoles, canAccessRole } from '../../lib/hierarchyUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = req.cookies['betx_session'];
    if (!session) {
      return res.status(401).json({ success: false, message: 'No session found' });
    }

    // Verify session
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
                      const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          return res.status(500).json({ success: false, message: 'Server configuration error' });
        }
        decoded = jwt.verify(session, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }

    const userId = decoded.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found in session' });
    }

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        // isActive removed: field not in schema
      }
    });

    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    // Get query parameters
    const { role, parentId } = req.query as { role?: string; parentId?: string };
    
    // Get accessible roles for current user
    const accessibleRoles = getAccessibleRoles(currentUser.role as any) as any[];
    
    // Build where clause
    let whereClause: any = {};
    
    // Filter by role if specified and accessible
    if (role && typeof role === 'string') {
      if (!(accessibleRoles as any).includes(role as any)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied: Cannot view ${role} users` 
        });
      }
      whereClause.role = role as any;
    } else {
      // If no specific role requested, only show accessible roles
      whereClause.role = { in: (accessibleRoles as any[]).map(r => r as any) };
    }
    
    // Filter by parentId if specified
    if (parentId && typeof parentId === 'string') {
      whereClause.parentId = parentId;
    }
    
    // No isActive field in schema

    // Get users with hierarchy information
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        limit: true,
        createdAt: true,
        contactno: true,
        parentId: true,
        parent: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true
          }
        },
        // _count removed
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    // Add hierarchy level information
    const usersWithHierarchy = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      creditLimit: user.limit,
      contactno: user.contactno,
      parentId: user.parentId,
      hierarchyLevel: (accessibleRoles as any[]).indexOf(user.role),
      canManage: canAccessRole(currentUser.role as any, user.role as any),
      directChildren: 0,
      totalChildren: 0
    }));

    return res.status(200).json({
      success: true,
      currentUser: {
        id: currentUser.id,
        role: currentUser.role
      },
      accessibleRoles,
      users: usersWithHierarchy,
      total: usersWithHierarchy.length
    });

  } catch (error) {
    console.error('Error in filtered users API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: (error as Error).message 
    });
  }
} 