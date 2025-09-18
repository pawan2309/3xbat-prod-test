import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export const runtime = 'nodejs';

// Function to get role prefix (3 letters)
function getRolePrefix(role: string): string {
  const rolePrefixes: { [key: string]: string } = {
    'OWNER': 'OWN',
    'ADMIN': 'ADM',
    'SUP_ADM': 'SUD',
    'SUB_OWN': 'SOW',
    'SUB_ADM': 'SUB', 
    'MAS_AGENT': 'MAS',
    'SUP_AGENT': 'SUP',
    'AGENT': 'AGE',
    'USER': 'USE'
  };
  return rolePrefixes[role] || 'USR';
}

// Function to generate username based on role (3 letters + 4 digits)
function generateUsername(role: string, existingUsers: string[] = []) {
  const prefix = getRolePrefix(role);
  let counter = 1;
  let username = `${prefix}${counter.toString().padStart(4, '0')}`;
  while (existingUsers.includes(username)) {
    counter++;
    username = `${prefix}${counter.toString().padStart(4, '0')}`;
  }
  return username;
}

// Function to generate unique code (same as username)
function generateCode(role: string, existingCodes: string[] = []) {
  return generateUsername(role, existingCodes);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List users with optional role, parentId, and status filtering
    try {
      const { role, parentId, status, isActive, excludeInactiveParents } = req.query;
      
      let whereClause: any = {};
      if (role && typeof role === 'string') {
        // Map old role names to new role names for backward compatibility
        const roleMapping: { [key: string]: string } = {
          'SUPER_ADMIN': 'SUP_ADM',
          'SUB_OWNER': 'SUB_OWN',
          'SUB_ADMIN': 'SUB_ADM',
          'MASTER': 'MAS_AGENT',
          'SUPER_AGENT': 'SUP_AGENT'
        };
        
        const mappedRole = roleMapping[role] || role;
        whereClause.role = mappedRole as any;
        
        console.log(`🔄 Role mapping: ${role} -> ${mappedRole}`);
      }
      if (parentId && typeof parentId === 'string') {
        whereClause.parentId = parentId;
      }
      if (typeof status === 'string') {
        whereClause.status = status as any;
      } else if (isActive !== undefined) {
        // Support legacy isActive by mapping to status
        const isActiveBool = String(isActive) === 'true';
        whereClause.status = isActiveBool ? 'ACTIVE' : 'INACTIVE';
        console.log('Filtering by isActive:', isActive, '-> status:', whereClause.status);
      }
      
      // If excludeInactiveParents is true, we need to filter out users whose parents are inactive
      if (excludeInactiveParents === 'true') {
        // Preserve the status filter while adding parent status filter
        const parentFilter = {
          OR: [
            { parentId: null }, // Top-level users (no parent)
            {
              parent: {
                status: 'ACTIVE' // Only users whose parent is active
              }
            }
          ]
        };
        
        // If we already have a status filter, combine them with AND
        if (whereClause.status) {
          whereClause.AND = [
            { status: whereClause.status },
            parentFilter
          ];
          delete whereClause.status; // Remove the direct status filter
        } else {
          whereClause.OR = parentFilter.OR;
        }
      }
      
      console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));
      
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          limit: true,
          status: true,
          createdAt: true,
          contactno: true,
          password: true, // Include password for credential sharing
          parentId: true,
          updatedAt: true,
          parent: {
            select: {
              username: true,
              name: true,
            }
          },
          userCommissionShare: {
            select: {
              share: true,
              available_share_percent: true,
              cshare: true,
              casinocommission: true,
              matchcommission: true,
              sessioncommission: true,
              session_commission_type: true,
              commissionType: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('Found users:', users.length);
      console.log('Where clause:', whereClause);
      console.log('Sample users:', users.slice(0, 3).map(u => ({ id: u.id, username: u.username, role: u.role, status: u.status })));
      
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users', error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    // Create a new user
    try {
      console.log('Creating user with body:', req.body);
      
      const { 
        role, 
        password, 
        name, 
        contactno, 
        reference,
        share,
        cshare,
        // icshare removed (not in schema)
        // mobileshare removed (not in schema)
        session_commission_type,
        matchcommission,
        sessioncommission,
        casinocommission,
        parentId,
        commissionType,
        casinoStatus,
        matchCommission,
        casinoShare,
        casinoCommission,
        // Parent commission fields
        myMatchCommission,
        mySessionCommission,
        myCasinoCommission,
        myCasinoShare,
        // requested initial limit
        limit: requestedLimitInput
      } = req.body;

      console.log('Extracted fields:', { role, name, contactno, parentId });

      // Validate required fields
      if (!role || !password || !name) {
        console.log('Missing required fields:', { role: !!role, password: !!password, name: !!name });
        return res.status(400).json({ success: false, message: 'Role, password, and name are required' });
      }

      // Validate role (align with schema)
      const validRoles = ['OWNER','SUB_OWN','SUP_ADM','ADMIN','SUB_ADM','MAS_AGENT','SUP_AGENT','AGENT','USER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}` });
      }

      // Validate contact number if provided - allow any numerical input
      if (contactno && !/^\d+$/.test(contactno)) {
        return res.status(400).json({ success: false, message: 'Contact number must contain only numbers' });
      }

      // Get existing usernames
      const existingUsers = await prisma.user.findMany({ 
        select: { username: true } 
      });
      const existingUsernames = existingUsers.map((u: { username: string }) => u.username);

      // Generate unique username
      const username = generateUsername(role, existingUsernames);

      // Store password in plain text for credential sharing
      console.log('Generated username:', username);
      console.log('Password stored in plain text for sharing');

      // Get the id of the currently logged-in user from the session
      const session = req.cookies['betx_session'];
      let creatorId: string | null = null;
      if (session) {
        try {
          const jwt = require('jsonwebtoken');
          const JWT_SECRET = process.env.JWT_SECRET;
          if (!JWT_SECRET) {
            return res.status(500).json({ success: false, message: 'Server configuration error' });
          }
          const decoded = jwt.verify(session, JWT_SECRET);
          creatorId = decoded.user?.id || null;
        } catch (e) {
          console.error('Error decoding session:', e);
          creatorId = null;
        }
      }

      // Ensure parentId is a valid UUID, not a role name
      let resolvedParentId: string | null = null;
      let parentUser: any = null;
      
      if (typeof parentId !== 'undefined' && parentId !== null) {
        // If parentId looks like a UUID, use it directly
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (uuidRegex.test(parentId)) {
          // Verify the parent user exists
          parentUser = await prisma.user.findUnique({ where: { id: parentId } });
          if (!parentUser) {
            return res.status(400).json({ success: false, message: `Parent user with ID ${parentId} not found.` });
          }
          resolvedParentId = parentId;
        } else {
          // If parentId is a role name, look up the first user with that role
          parentUser = await prisma.user.findFirst({ where: { role: parentId } });
          if (parentUser) {
            resolvedParentId = parentUser.id;
          } else {
            return res.status(400).json({ success: false, message: `No user found with role ${parentId} to use as parent.` });
          }
        }
      } else {
        // Determine if the new user is a top-level role
        const topLevelRoles = ['SUB_OWNER']; // legacy value retained, adjust as needed
        const isTopLevel = topLevelRoles.includes(role);
        resolvedParentId = isTopLevel ? null : creatorId;
        
        // If not top-level, get the creator as parent
        if (!isTopLevel && creatorId) {
          parentUser = await prisma.user.findUnique({ where: { id: creatorId } });
        }
      }

      // Validate share hierarchy - child shares cannot exceed parent shares
      if (parentUser) {
        // Get parent's commission share data
        const parentCommissionShare = await prisma.userCommissionShare.findUnique({
          where: { userId: parentUser.id }
        });

        // Validate main share
        if (share !== undefined && share !== null) {
          const childShare = parseFloat(share) || 0;
          const parentShare = parentCommissionShare?.share || 0;
          
          if (childShare > parentShare) {
            return res.status(400).json({ 
              success: false, 
              message: `Child share (${childShare}%) cannot exceed parent share (${parentShare}%). Please set child share to ${parentShare}% or less.` 
            });
          }
          console.log(`Main share validation passed: Child share ${childShare}% <= Parent share ${parentShare}%`);
        }

        // Validate cshare (casino share)
        if (cshare !== undefined && cshare !== null) {
          const childCshare = parseFloat(cshare) || 0;
          const parentCshare = parentCommissionShare?.cshare || 0;
          
          if (childCshare > parentCshare) {
            return res.status(400).json({ 
              success: false, 
              message: `Child casino share (${childCshare}%) cannot exceed parent casino share (${parentCshare}%). Please set child casino share to ${parentCshare}% or less.` 
            });
          }
          console.log(`Casino share validation passed: Child cshare ${childCshare}% <= Parent cshare ${parentCshare}%`);
        }

        // Schema has no icshare/mobileshare on user; skip
      }

      const requestedLimit = requestedLimitInput !== undefined ? Number(requestedLimitInput) : 0;

      // Create user with basic fields
      const userData: any = {
        username,
        name,
        password: password, // Store in plain text for credential sharing
        role: role as any, // Cast to schema enum
        parentId: resolvedParentId,
        limit: requestedLimit,
        status: 'ACTIVE',
        reference: reference || null,
        contactno: contactno || null,
        casinoStatus: typeof casinoStatus === 'boolean' ? casinoStatus : (casinoStatus === 'true'),
      };

      console.log('Creating user with data:', userData);

      const user = await prisma.user.create({
        data: userData
      });

      // Create UserCommissionShare record with actual values from frontend
      const commissionShareData = {
        userId: user.id,
        share: parseFloat(share) || 0,
        available_share_percent: parseFloat(share) || 0, // Initially, available share equals assigned share
        cshare: parseFloat(cshare) || 0,
        casinocommission: parseFloat(casinocommission) || 0,
        matchcommission: parseFloat(matchcommission) || 0, // Use actual value from frontend
        sessioncommission: parseFloat(sessioncommission) || 0, // Use actual value from frontend
        session_commission_type: session_commission_type || "No Comm",
        commissionType: commissionType || null,
      };

      // Update parent's commission values if provided
      if (parentUser && (myMatchCommission !== undefined || mySessionCommission !== undefined || myCasinoCommission !== undefined || myCasinoShare !== undefined)) {
        const parentUpdateData: any = {};
        
        if (myMatchCommission !== undefined) {
          parentUpdateData.matchcommission = parseFloat(myMatchCommission) || 0;
        }
        if (mySessionCommission !== undefined) {
          parentUpdateData.sessioncommission = parseFloat(mySessionCommission) || 0;
        }
        if (myCasinoCommission !== undefined) {
          parentUpdateData.casinocommission = parseFloat(myCasinoCommission) || 0;
        }
        if (myCasinoShare !== undefined) {
          parentUpdateData.cshare = parseFloat(myCasinoShare) || 0;
        }

        if (Object.keys(parentUpdateData).length > 0) {
          await prisma.userCommissionShare.update({
            where: { userId: parentUser.id },
            data: parentUpdateData
          });
          console.log('Updated parent commission values:', parentUpdateData);
        }
      }

      // Handle casinoShare and casinoCommission fields consistently
      if (casinoShare !== undefined && casinoShare !== '') {
        commissionShareData.cshare = parseFloat(casinoShare) || 0;
      }
      if (casinoCommission !== undefined && casinoCommission !== '') {
        commissionShareData.casinocommission = parseFloat(casinoCommission) || 0;
      }

      console.log('Creating commission share with data:', commissionShareData);
      await prisma.userCommissionShare.create({
        data: {
          userId: user.id,
          share: commissionShareData.share,
          available_share_percent: commissionShareData.available_share_percent,
          cshare: commissionShareData.cshare,
          casinocommission: commissionShareData.casinocommission,
          matchcommission: commissionShareData.matchcommission,
          sessioncommission: commissionShareData.sessioncommission,
          session_commission_type: commissionShareData.session_commission_type,
          commissionType: commissionShareData.commissionType,
          updatedAt: new Date()
        }
      });
      console.log('Commission share created successfully for user:', user.id);

      console.log('User created successfully:', user.id);

      return res.status(201).json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name,
          role: user.role, 
          status: user.status
        } 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Check for specific database errors
      const e: any = error;
      if (e && e.code === 'P2002') {
        return res.status(400).json({ success: false, message: 'Username already exists. Please try again.' });
      }
      
      return res.status(500).json({ success: false, message: 'Failed to create user', error: (error as Error).message });
    }
  }

  if (req.method === 'GET' && req.url?.includes('/by-role')) {
    // Handle /api/users/by-role endpoint
    try {
      const { role } = req.query;
      
      if (!role || typeof role !== 'string') {
        return res.status(400).json({ success: false, message: 'Role parameter is required' });
      }

      // Map old role names to new role names for backward compatibility
      const roleMapping: { [key: string]: string } = {
        'SUPER_ADMIN': 'SUP_ADM',
        'SUB_OWNER': 'SUB_OWN',
        'SUB_ADMIN': 'SUB_ADM',
        'MASTER': 'MAS_AGENT',
        'SUPER_AGENT': 'SUP_AGENT'
      };
      
      const mappedRole = roleMapping[role] || role;
      
      const users = await prisma.user.findMany({
        where: { 
          role: mappedRole as any,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          status: true,
          contactno: true,
          parentId: true,
          createdAt: true,
          parent: {
            select: {
              username: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform users to match the expected format for the modal
      const transformedUsers = users.map(user => ({
        id: user.id,
        label: `${user.username} - ${user.name}`,
        value: user.id,
        username: user.username,
        name: user.name,
        code: user.username // Using username as code
      }));

      console.log(`Found ${transformedUsers.length} users with role ${mappedRole}`);
      
      return res.status(200).json({ success: true, users: transformedUsers });
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch users by role', error: (error as Error).message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

export default handler; 