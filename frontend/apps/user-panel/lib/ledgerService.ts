import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * Ledger Service for all betting-related financial transactions
 */
export class LedgerService {
  /**
   * Apply a limit update from one user to another
   */
  static async applyLimitUpdate(fromUserId: string, toUserId: string, amount: number, remark: string) {
    // Update the toUser's credit limit
    const toUser = await prisma.user.update({
      where: { id: toUserId },
      data: { creditLimit: { increment: amount } },
    });
    // Create a ledger entry for the limit update
    return prisma.ledger.create({
      data: {
        userId: toUserId,
        type: 'LIMIT_UPDATE',
        amount: amount,
      },
    });
  }

  /**
   * Record a user's win/loss for a match
   */
  static async recordPNL(userId: string, matchId: string, amount: number, isWin: boolean) {
    // No balance update needed
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    // Create ledger entry
    return prisma.ledger.create({
      data: {
        userId,
        matchId,
        type: isWin ? 'WIN' : 'LOSS',
        amount: isWin ? amount : -amount,
      },
    });
  }

  /**
   * Distribute profit/loss up the user hierarchy based on share percentages
   * amount: positive for profit, negative for loss (from the perspective of the user)
   */
  static async distributeProfitLoss(userId: string, amount: number, matchId: string) {
    // Traverse up the hierarchy
    let currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new Error('User not found');
    let remaining = Math.abs(amount);
    let direction = amount > 0 ? 1 : -1; // 1: profit, -1: loss
    let parentId = currentUser.parentId;
    while (parentId && remaining > 0.0001) {
      const parent = await prisma.user.findUnique({ where: { id: parentId }, include: { UserCommissionShare: true } });
      if (!parent) break;
      const share = parent.UserCommissionShare?.share ?? 0;
      const shareAmount = (remaining * share) / 100;
      if (shareAmount > 0) {
        // Credit or debit parent accordingly
        await prisma.ledger.create({
          data: {
            userId: parent.id,
            matchId,
            type: direction > 0 ? 'PNL_CREDIT' : 'PNL_DEBIT',
            amount: direction > 0 ? shareAmount : -shareAmount,
          },
        });
        // No balance update needed
      }
      // Move up
      remaining -= shareAmount;
      currentUser = parent;
      parentId = parent.parentId;
    }
    // If any remaining, assign to topmost upline
    if (remaining > 0.0001 && currentUser) {
      await prisma.ledger.create({
        data: {
          userId: currentUser.id,
          matchId,
          type: direction > 0 ? 'PNL_CREDIT' : 'PNL_DEBIT',
          amount: direction > 0 ? remaining : -remaining,
        },
      });
    }
  }

  /**
   * Settle a user's balance (manual or automated)
   */
  static async settleUserBalance(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    // No balance to settle
    return null;
  }

  /**
   * Get a user's ledger statement with optional filters
   */
  static async getLedgerStatement(userId: string, filterOptions: any = {}) {
    const where: any = { userId };
    if (filterOptions.type) where.type = filterOptions.type;
    if (filterOptions.matchId) where.matchId = filterOptions.matchId;
    if (filterOptions.startDate || filterOptions.endDate) {
      where.createdAt = {};
      if (filterOptions.startDate) where.createdAt.gte = filterOptions.startDate;
      if (filterOptions.endDate) where.createdAt.lte = filterOptions.endDate;
    }
    return prisma.ledger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
} 