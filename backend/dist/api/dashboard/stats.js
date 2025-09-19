"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        // Get various statistics
        const [totalUsers, activeUsers, totalMatches, liveMatches, pendingBets, totalBets, totalBalance, todayBets] = await Promise.all([
            // User statistics
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count(),
            // Match statistics
            prisma_1.prisma.match.count(),
            prisma_1.prisma.match.count({ where: { status: 'INPLAY' } }),
            // Bet statistics
            prisma_1.prisma.bet.count({ where: { status: 'PENDING' } }),
            prisma_1.prisma.bet.count(),
            // Balance statistics
            prisma_1.prisma.user.aggregate({
                _sum: { limit: true }
            }),
            // Today's bets
            prisma_1.prisma.bet.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);
        // Get recent activity
        const recentBets = await prisma_1.prisma.bet.findMany({
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
        const recentMatches = await prisma_1.prisma.match.findMany({
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
                    upcoming: await prisma_1.prisma.match.count({ where: { status: 'UPCOMING' } }),
                    closed: await prisma_1.prisma.match.count({ where: { status: 'COMPLETED' } })
                },
                bets: {
                    total: totalBets,
                    pending: pendingBets,
                    today: todayBets,
                    won: await prisma_1.prisma.bet.count({ where: { status: 'WON' } }),
                    lost: await prisma_1.prisma.bet.count({ where: { status: 'LOST' } })
                },
                financial: {
                    totalBalance: totalBalance._sum.limit || 0,
                    totalStake: await prisma_1.prisma.bet.aggregate({
                        _sum: { stake: true }
                    }).then(result => result._sum.stake || 0),
                    totalWinnings: await prisma_1.prisma.bet.aggregate({
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
}
//# sourceMappingURL=stats.js.map