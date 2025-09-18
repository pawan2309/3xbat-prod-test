import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { verifyToken } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // CRITICAL: Add authentication
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.betx_session;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // OWNER is restricted to control panel only
    if (decoded.role === 'OWNER') {
      return res.status(403).json({ message: 'Access denied - OWNER restricted to control panel' });
    }

    const { fromUserId, toUserId, amount, remark } = req.body;

    // Validation
    if (!fromUserId || !toUserId || !amount || !remark) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: 'Cannot transfer to same user' });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get both users
    const [fromUser, toUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: fromUserId } }),
      prisma.user.findUnique({ where: { id: toUserId } })
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    // Check if fromUser has sufficient limit
    if (((fromUser as any).limit || 0) < parsedAmount) {
      return res.status(400).json({ 
        message: 'Insufficient credit limit for transfer',
        currentLimit: (fromUser as any).limit || 0,
        requestedAmount: parsedAmount
      });
    }

    // Perform the transfer within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from source user
      const updatedFromUser = await tx.user.update({
        where: { id: fromUserId },
        data: { limit: (((fromUser as any).limit || 0) - parsedAmount) as any }
      });

      // Add to destination user
      const updatedToUser = await tx.user.update({
        where: { id: toUserId },
        data: { limit: (((toUser as any).limit || 0) + parsedAmount) as any }
      });

      // Create ledger entry for source user (debit)
      await tx.ledger.create({ data: {
        userId: fromUserId,
        type: 'ADJUSTMENT',
        amount: -parsedAmount,
      } });

      // Create ledger entry for destination user (credit)
      await tx.ledger.create({ data: {
        userId: toUserId,
        type: 'ADJUSTMENT',
        amount: parsedAmount,
      } });

      return { updatedFromUser, updatedToUser };
    });

    return res.status(200).json({
      success: true,
      message: 'Credit limit transferred successfully',
      data: {
        fromUser: {
          id: fromUserId,
          oldLimit: (fromUser as any).limit || 0,
          newLimit: (result.updatedFromUser as any).limit,
          change: -parsedAmount
        },
        toUser: {
          id: toUserId,
          oldLimit: (toUser as any).limit || 0,
          newLimit: (result.updatedToUser as any).limit,
          change: parsedAmount
        },
        amount: parsedAmount,
        remark
      }
    });

  } catch (error) {
    console.error('Error in transfer-limit:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 