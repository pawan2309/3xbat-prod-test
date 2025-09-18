import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// GET /api/users - List users with optional filtering
export const getUsers = async (req: Request, res: Response) => {
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
    if (excludeInactiveParents === 'true') {
      whereClause.parent = {
        status: 'ACTIVE'
      };
    }

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
        password: true,
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

    // Transform users to include frontend-expected fields
    const transformedUsers = users.map(user => ({
      ...user,
      code: user.username, // Map username to code
      creditLimit: user.limit, // Map limit to creditLimit
      isActive: user.status === 'ACTIVE', // Map status to isActive boolean
      UserCommissionShare: user.userCommissionShare // Ensure proper casing
    }));
    
    console.log('Found users:', transformedUsers.length);
    console.log('Where clause:', whereClause);
    console.log('Sample users:', transformedUsers.slice(0, 3).map(u => ({ id: u.id, username: u.username, role: u.role, status: u.status, isActive: u.isActive })));
    
    return res.status(200).json({ success: true, users: transformedUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: (error as Error).message });
  }
};

// POST /api/users - Create a new user
export const createUser = async (req: Request, res: Response) => {
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
      icshare,
      mobileshare,
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
      myCasinoShare
    } = req.body;

    console.log('Extracted fields:', { role, name, contactno, parentId });

    // Validate required fields
    if (!role || !password || !name) {
      console.log('Missing required fields:', { role: !!role, password: !!password, name: !!name });
      return res.status(400).json({ success: false, message: 'Role, password, and name are required' });
    }

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'SUP_ADM', 'SUB_OWN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'];
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
    const existingUsernames = existingUsers.map(u => u.username);

    // Generate unique username
    const username = generateUsername(role, existingUsernames);

    console.log('Generated username:', username);

    // Create user with commission share
    const user = await prisma.user.create({
      data: {
        username,
        password, // Store in plain text for credential sharing
        name,
        role: role as any,
        contactno: contactno || null,
        parentId: parentId || null,
        status: 'ACTIVE',
        userCommissionShare: {
          create: {
            share: parseFloat(share) || 0,
            available_share_percent: parseFloat(share) || 0,
            cshare: parseFloat(cshare) || 0,
            session_commission_type: session_commission_type || 'PERCENTAGE',
            matchcommission: parseFloat(matchcommission) || 0,
            sessioncommission: parseFloat(sessioncommission) || 0,
            casinocommission: parseFloat(casinocommission) || 0,
            commissionType: commissionType || 'PERCENTAGE'
          }
        }
      },
      include: {
        userCommissionShare: true,
        parent: {
          select: {
            username: true,
            name: true
          }
        }
      }
    });

    console.log('User created successfully:', user.username);

    return res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      } 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check for specific database errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Username or code already exists. Please try again.' });
    }
    
    return res.status(500).json({ success: false, message: 'Failed to create user', error: (error as Error).message });
  }
};

// GET /api/users/:id - Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userCommissionShare: true,
        parent: {
          select: {
            username: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: (error as Error).message });
  }
};

// PUT /api/users/:id - Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        userCommissionShare: true,
        parent: {
          select: {
            username: true,
            name: true
          }
        }
      }
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user', error: (error as Error).message });
  }
};

// DELETE /api/users/:id - Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: (error as Error).message });
  }
};

// Additional handler functions (placeholders for now)
export const getUsersByRole = async (req: Request, res: Response) => {
  // Implementation for getUsersByRole
  res.status(200).json({ success: true, message: 'Get users by role - to be implemented' });
};

export const getFilteredUsers = async (req: Request, res: Response) => {
  // Implementation for getFilteredUsers
  res.status(200).json({ success: true, message: 'Get filtered users - to be implemented' });
};

export const getRoleBasedUsers = async (req: Request, res: Response) => {
  // Implementation for getRoleBasedUsers
  res.status(200).json({ success: true, message: 'Get role-based users - to be implemented' });
};

export const updateUserLimit = async (req: Request, res: Response) => {
  // Implementation for updateUserLimit
  res.status(200).json({ success: true, message: 'Update user limit - to be implemented' });
};

export const updateUserLimits = async (req: Request, res: Response) => {
  // Implementation for updateUserLimits
  res.status(200).json({ success: true, message: 'Update user limits - to be implemented' });
};

export const transferLimit = async (req: Request, res: Response) => {
  // Implementation for transferLimit
  res.status(200).json({ success: true, message: 'Transfer limit - to be implemented' });
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId, isActive } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean value' });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: isActive ? 'ACTIVE' : 'INACTIVE'
      },
      select: {
        id: true,
        username: true,
        name: true,
        status: true,
        role: true
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status',
      error: (error as Error).message 
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  // Implementation for changePassword
  res.status(200).json({ success: true, message: 'Change password - to be implemented' });
};

export const shareCommission = async (req: Request, res: Response) => {
  // Implementation for shareCommission
  res.status(200).json({ success: true, message: 'Share commission - to be implemented' });
};

export const getUserLedger = async (req: Request, res: Response) => {
  // Implementation for getUserLedger
  res.status(200).json({ success: true, message: 'Get user ledger - to be implemented' });
};

export const createManualLedger = async (req: Request, res: Response) => {
  // Implementation for createManualLedger
  res.status(200).json({ success: true, message: 'Create manual ledger - to be implemented' });
};
