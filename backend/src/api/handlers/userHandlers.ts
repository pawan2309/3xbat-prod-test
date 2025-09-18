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
  try {
    const { userId, newLimit, reason } = req.body;
    
    if (!userId || newLimit === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and new limit are required' 
      });
    }

    const numericLimit = parseFloat(newLimit);
    if (isNaN(numericLimit) || numericLimit < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Limit must be a non-negative number' 
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, limit: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldLimit = user.limit;

    // Update user limit
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { limit: numericLimit },
      select: {
        id: true,
        username: true,
        name: true,
        limit: true,
        role: true
      }
    });

    // Create ledger entry for limit change
    await prisma.ledger.create({
      data: {
        userId: userId,
        type: 'LIMIT_CHANGE',
        amount: 0,
        matchId: null,
        marketId: null,
        betId: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'User limit updated successfully',
      user: updatedUser,
      oldLimit,
      newLimit: numericLimit
    });
  } catch (error) {
    console.error('Error updating user limit:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update user limit', 
      error: (error as Error).message 
    });
  }
};

export const updateUserLimits = async (req: Request, res: Response) => {
  // Implementation for updateUserLimits
  res.status(200).json({ success: true, message: 'Update user limits - to be implemented' });
};

export const transferLimit = async (req: Request, res: Response) => {
  try {
    const { fromUserId, toUserId, amount, reason } = req.body;
    
    if (!fromUserId || !toUserId || amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'From user ID, to user ID, and amount are required' 
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot transfer limit to the same user' 
      });
    }

    // Verify both users exist
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: fromUserId },
        select: { id: true, username: true, name: true, limit: true }
      }),
      prisma.user.findUnique({
        where: { id: toUserId },
        select: { id: true, username: true, name: true, limit: true }
      })
    ]);

    if (!fromUser) {
      return res.status(404).json({ success: false, message: 'From user not found' });
    }
    if (!toUser) {
      return res.status(404).json({ success: false, message: 'To user not found' });
    }

    // Check if from user has sufficient limit
    if (fromUser.limit < numericAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient limit. Available: ${fromUser.limit}, Requested: ${numericAmount}` 
      });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update from user's limit
      const updatedFromUser = await tx.user.update({
        where: { id: fromUserId },
        data: { limit: fromUser.limit - numericAmount },
        select: { id: true, username: true, name: true, limit: true }
      });

      // Update to user's limit
      const updatedToUser = await tx.user.update({
        where: { id: toUserId },
        data: { limit: toUser.limit + numericAmount },
        select: { id: true, username: true, name: true, limit: true }
      });

      // Create ledger entries for both users
      await tx.ledger.create({
        data: {
          userId: fromUserId,
          type: 'LIMIT_TRANSFER_OUT',
          amount: -numericAmount,
          matchId: null,
          marketId: null,
          betId: null
        }
      });

      await tx.ledger.create({
        data: {
          userId: toUserId,
          type: 'LIMIT_TRANSFER_IN',
          amount: numericAmount,
          matchId: null,
          marketId: null,
          betId: null
        }
      });

      return { updatedFromUser, updatedToUser };
    });

    return res.status(200).json({
      success: true,
      message: 'Limit transferred successfully',
      fromUser: result.updatedFromUser,
      toUser: result.updatedToUser,
      amount: numericAmount
    });
  } catch (error) {
    console.error('Error transferring limit:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to transfer limit', 
      error: (error as Error).message 
    });
  }
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
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, current password, new password, and confirm password are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password and confirm password do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Verify user exists and get current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, password: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password (assuming passwords are stored in plain text for this system)
    if (user.password !== currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
      select: {
        id: true,
        username: true,
        name: true,
        role: true
      }
    });

    // Create ledger entry for password change
    await prisma.ledger.create({
      data: {
        userId: userId,
        type: 'PASSWORD_CHANGE',
        amount: 0,
        matchId: null,
        marketId: null,
        betId: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to change password', 
      error: (error as Error).message 
    });
  }
};

export const shareCommission = async (req: Request, res: Response) => {
  // Implementation for shareCommission
  res.status(200).json({ success: true, message: 'Share commission - to be implemented' });
};

export const getUserLedger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Get user's ledger entries
    const ledgerEntries = await prisma.ledger.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 entries
    });

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        limit: true,
        status: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate current balance
    const currentBalance = ledgerEntries.reduce((sum, entry) => {
      return sum + entry.amount;
    }, 0);

    return res.status(200).json({
      success: true,
      user,
      ledger: ledgerEntries,
      currentBalance,
      totalEntries: ledgerEntries.length
    });
  } catch (error) {
    console.error('Error fetching user ledger:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user ledger', 
      error: (error as Error).message 
    });
  }
};

export const createManualLedger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, description, reference } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!type || !amount || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, amount, and description are required' 
      });
    }

    if (!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either "credit" or "debit"' 
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create ledger entry
    const ledgerEntry = await prisma.ledger.create({
      data: {
        userId: id,
        type: type.toUpperCase(),
        amount: type === 'credit' ? numericAmount : -numericAmount,
        matchId: null,
        marketId: null,
        betId: null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Manual ledger entry created successfully',
      ledgerEntry
    });
  } catch (error) {
    console.error('Error creating manual ledger entry:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create manual ledger entry', 
      error: (error as Error).message 
    });
  }
};
