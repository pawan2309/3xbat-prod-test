import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../../monitoring/logging/logger';

const router = Router();
const prisma = new PrismaClient();

// Get user's bets with categorization
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { category, status } = req.query;

    // Build where clause
    const whereClause: any = {
      userId: userId
    };

    // Filter by category if provided
    if (category && (category === 'match' || category === 'session')) {
      whereClause.betCategory = category.toUpperCase();
    }

    // Filter by status if provided
    if (status && ['PENDING', 'WON', 'LOST', 'VOID', 'CANCELED'].includes(status as string)) {
      whereClause.status = status;
    }

    const bets = await prisma.bet.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to 100 bets for performance
    });

    // Categorize bets for table display
    const categorizedBets = {
      matchBets: bets.filter(bet => bet.betCategory === 'MATCH'),
      sessionBets: bets.filter(bet => bet.betCategory === 'SESSION'),
      casinoBets: bets.filter(bet => bet.betCategory === 'CASINO' || (!bet.matchId && !bet.marketId))
    };

    logger.info(`Fetched ${bets.length} bets for user ${userId}`);

    res.json({
      success: true,
      data: {
        allBets: bets,
        categorizedBets,
        total: bets.length
      }
    });

  } catch (error) {
    logger.error('Error fetching user bets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bets'
    });
  }
});

// Get bet statistics for user
router.get('/user/:userId/stats', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await prisma.bet.groupBy({
      by: ['status', 'betCategory'],
      where: {
        userId: userId
      },
      _count: {
        id: true
      },
      _sum: {
        stake: true,
        profitLoss: true
      }
    });

    // Calculate summary statistics
    const totalBets = await prisma.bet.count({
      where: { userId }
    });

    const wonBets = await prisma.bet.count({
      where: { 
        userId,
        status: 'WON'
      }
    });

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalBets,
        wonBets,
        lostBets: await prisma.bet.count({
          where: { 
            userId,
            status: 'LOST'
          }
        }),
        winRate: Math.round(winRate * 100) / 100,
        detailedStats: stats
      }
    });

  } catch (error) {
    logger.error('Error fetching bet statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bet statistics'
    });
  }
});

export default router;
