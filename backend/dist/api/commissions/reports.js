"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
// Role-based access control middleware
function withRoleAuth(handler) {
    return async (req, res) => {
        try {
            // Get user session from cookies
            const session = req.cookies['betx_session'];
            if (!session) {
                return res.status(401).json({ success: false, message: 'No session found' });
            }
            // Verify session
            const jwt = require('jsonwebtoken');
            let decoded;
            try {
                decoded = jwt.verify(session, process.env.JWT_SECRET || 'dev_secret');
            }
            catch (error) {
                return res.status(401).json({ success: false, message: 'Invalid session' });
            }
            const userRole = decoded.user?.role;
            if (!userRole) {
                return res.status(401).json({ success: false, message: 'User role not found in session' });
            }
            // Check if user can access restricted sections (COMMISSIONS, OLD DATA, LOGIN REPORTS)
            // Only SUB_OWNER and above can access these sections
            const restrictedRoles = ['SUB_OWNER'];
            if (!restrictedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Commissions section is restricted to SUB_OWNER and above'
                });
            }
            // Add user info to request for use in handler
            req.user = decoded.user;
            // Call the original handler
            return handler(req, res);
        }
        catch (error) {
            console.error('Role auth middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    };
}
exports.default = withRoleAuth(async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        const { userId, startDate, endDate, role } = req.query;
        // Get commission reports based on filters
        if (userId) {
            // Individual user commission report
            const report = await getUserCommissionReport(userId, startDate, endDate);
            return res.status(200).json({ success: true, data: report });
        }
        else if (role) {
            // Role-based commission report
            const report = await getRoleCommissionReport(role, startDate, endDate);
            return res.status(200).json({ success: true, data: report });
        }
        else {
            // Overall commission report
            const report = await getOverallCommissionReport(startDate, endDate);
            return res.status(200).json({ success: true, data: report });
        }
    }
    catch (error) {
        console.error('Error generating commission report:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * Get commission report for a specific user
 */
async function getUserCommissionReport(userId, startDate, endDate) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        throw new Error('User not found');
    }
    const whereClause = { userId };
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }
    // Placeholder: profitDistribution table not present in schema
    const distributions = [];
    // Placeholder summary
    const summary = { total: 0 };
    const dailyBreakdown = [];
    return {
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        },
        summary,
        distributions,
        dailyBreakdown,
        totalCommissions: distributions.reduce((sum, dist) => sum + dist.amountEarned, 0),
        totalBets: distributions.length
    };
}
/**
 * Get commission report for a specific role
 */
async function getRoleCommissionReport(role, startDate, endDate) {
    const whereClause = {};
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }
    // Get all users with the specified role
    const users = await prisma_1.prisma.user.findMany({
        where: { role: role },
        include: {
            userCommissionShare: true
        }
    });
    // Calculate role summary
    const roleSummary = users.map((user) => ({
        userId: user.id,
        username: user.username,
        name: user.name,
        totalCommissions: 0,
        totalBets: 0,
        commissionConfig: {
            share: user.userCommissionShare?.share || 0,
            matchcommission: user.userCommissionShare?.matchcommission || 0,
            sessioncommission: user.userCommissionShare?.sessioncommission || 0
        }
    }));
    const totalRoleCommissions = roleSummary.reduce((sum, user) => sum + user.totalCommissions, 0);
    const totalRoleBets = roleSummary.reduce((sum, user) => sum + user.totalBets, 0);
    return {
        role,
        totalUsers: users.length,
        totalCommissions: totalRoleCommissions,
        totalBets: totalRoleBets,
        averageCommissionPerUser: users.length > 0 ? totalRoleCommissions / users.length : 0,
        users: roleSummary
    };
}
/**
 * Get overall commission report
 */
async function getOverallCommissionReport(startDate, endDate) {
    const whereClause = {};
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }
    // Get overall statistics
    const totalCommissions = { _sum: { amountEarned: 0 }, _count: 0 };
    // Get commission breakdown by role
    const roleBreakdown = [];
    // Get user details for role breakdown
    const userIds = roleBreakdown.map(item => item.userId);
    const users = await prisma_1.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, role: true }
    });
    const roleSummary = users.reduce((acc, user) => {
        const userCommissions = roleBreakdown.find(item => item.userId === user.id);
        if (userCommissions) {
            if (!acc[user.role]) {
                acc[user.role] = { total: 0, users: 0 };
            }
            acc[user.role].total += userCommissions._sum.amountEarned || 0;
            acc[user.role].users += 1;
        }
        return acc;
    }, {});
    // Get daily commission trend
    const dailyTrend = [];
    return {
        totalCommissions: totalCommissions._sum.amountEarned || 0,
        totalDistributions: totalCommissions._count || 0,
        roleBreakdown: roleSummary,
        dailyTrend,
        period: {
            startDate: startDate || 'All time',
            endDate: endDate || 'All time'
        }
    };
}
//# sourceMappingURL=reports.js.map