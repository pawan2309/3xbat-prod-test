"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get various statistics
        const [totalUsers, activeUsers, totalMatches, liveMatches, pendingBets, totalBets, totalBalance, todayBets] = await Promise.all([
            // User statistics
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            // Match statistics
            prisma.match.count(),
            prisma.match.count({ where: { status: 'INPLAY' } }),
            // Bet statistics
            prisma.bet.count({ where: { status: 'PENDING' } }),
            prisma.bet.count(),
            // Balance statistics
            prisma.user.aggregate({
                _sum: { limit: true }
            }),
            // Today's bets
            prisma.bet.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);
        // Get recent activity
        const recentBets = await prisma.bet.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                match: {
                    select: {
                        matchName: true,
                        externalMatchId: true
                    }
                }
            }
        });
        const recentMatches = await prisma.match.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { bets: true }
                }
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: totalUsers - activeUsers
                },
                matches: {
                    total: totalMatches,
                    live: liveMatches,
                    upcoming: await prisma.match.count({ where: { status: 'UPCOMING' } }),
                    closed: await prisma.match.count({ where: { status: 'COMPLETED' } })
                },
                bets: {
                    total: totalBets,
                    pending: pendingBets,
                    today: todayBets,
                    won: await prisma.bet.count({ where: { status: 'WON' } }),
                    lost: await prisma.bet.count({ where: { status: 'LOST' } })
                },
                financial: {
                    totalBalance: totalBalance._sum.limit || 0,
                    totalStake: await prisma.bet.aggregate({
                        _sum: { stake: true }
                    }).then(result => result._sum.stake || 0),
                    totalWinnings: await prisma.bet.aggregate({
                        where: { status: 'WON' },
                        _sum: { profitLoss: true }
                    }).then(result => result._sum.profitLoss || 0)
                },
                recent: {
                    bets: recentBets,
                    matches: recentMatches
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map