import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../../lib/auth';

export const runtime = 'nodejs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.betx_session;
    console.log('🔍 Users API: Checking authentication');
    console.log('🔑 Token found:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if token looks like a valid JWT (should be 3 parts separated by dots)
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.log('❌ Token format invalid - not a valid JWT');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = verifyToken(token);
    console.log('🔍 Token decoded successfully');
    
    if (!decoded) {
      console.log('❌ Token verification failed');
      console.log('❌ Token verification failed - token might be malformed');
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.log('✅ Authentication successful for user:', decoded.username);

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          userCommissionShare: true,
          parent: {
            select: {
              id: true,
              username: true,
              name: true,
              role: true
            }
          },
          children: {
            select: {
              id: true,
              username: true,
              name: true,
              role: true,
              // isActive removed
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Apply role-based access control
      const requestingUserRole = decoded.role;
      const requestingUserId = decoded.userId || decoded.user?.id;
      
      // OWNER is restricted to control panel only
      if (requestingUserRole === 'OWNER') {
        return res.status(403).json({ message: 'Access denied - OWNER restricted to control panel' });
      }
      
      // USER can only access their own data
      if (requestingUserRole === 'USER' && user.id !== requestingUserId) {
        return res.status(403).json({ message: 'Access denied - can only access own data' });
      }
      
      // OWNER data is not accessible from user panel
      if (user.role === 'OWNER') {
        return res.status(403).json({ message: 'Access denied - OWNER data not accessible from user panel' });
      }
      
      // Check hierarchy access for other roles
      if (requestingUserRole !== 'USER') {
        const { canAccessUserData } = await import('../../shared/utils/roleHierarchy');
        if (!canAccessUserData(requestingUserRole, user.role)) {
          return res.status(403).json({ message: 'Access denied - insufficient permissions' });
        }
      }

      return res.status(200).json({ success: true, user });
    }

    if (req.method === 'PUT') {
      const {
        name,
        contactno,
        casinoShare,
        casinocommission,
        ishare,
        mobileshare,
        isActive
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (contactno !== undefined) updateData.contactno = contactno;
      if (isActive !== undefined) updateData.status = isActive ? 'ACTIVE' : 'INACTIVE';

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });

      // Handle commission share updates
      if (casinoShare !== undefined || casinocommission !== undefined) {
        const commissionShareData = {
          cshare: parseFloat(casinoShare) || 0,
          casinocommission: parseFloat(casinocommission) || 0,
          share: parseFloat(ishare) || 0
        };

        // Check if commission share exists and update/create accordingly
        const existingShare = await prisma.userCommissionShare.findUnique({
          where: { userId: id }
        });

        if (existingShare) {
          await prisma.userCommissionShare.update({
            where: { userId: id },
            data: commissionShareData
          });
        } else {
          await prisma.userCommissionShare.create({
            data: {
              userId: id,
              cshare: commissionShareData.cshare,
              casinocommission: commissionShareData.casinocommission,
              share: commissionShareData.share
            }
          });
        }

        // Update parent commission values if this user has children
        if (updatedUser.parentId) {
          const children = await prisma.user.findMany({
            where: { parentId: updatedUser.parentId }
          });

          let totalChildShare = 0;
          
          // Calculate total child share sequentially since we can't use async in reduce
          for (const child of children) {
            const childCommissionShare = await prisma.userCommissionShare.findUnique({
              where: { userId: child.id }
            });
            totalChildShare += (childCommissionShare?.cshare || 0);
          }

          // Note: cshare is not a direct property of User model
          // We need to update the UserCommissionShare record instead
          const parentCommissionShare = await prisma.userCommissionShare.findUnique({
            where: { userId: updatedUser.parentId }
          });

          if (parentCommissionShare) {
            await prisma.userCommissionShare.update({
              where: { id: parentCommissionShare.id },
              data: {
                cshare: Math.max(0, 100 - totalChildShare)
              }
            });
          }
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: 'User updated successfully',
        user: updatedUser
      });
    }

  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 