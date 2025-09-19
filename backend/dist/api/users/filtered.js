"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
const hierarchyUtils_1 = require("../../lib/hierarchyUtils");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        // Get user session
        const session = req.cookies['betx_session'];
        if (!session) {
            return res.status(401).json({ success: false, message: 'No session found' });
        }
        // Verify session
        const jwt = require('jsonwebtoken');
        let decoded;
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                return res.status(500).json({ success: false, message: 'Server configuration error' });
            }
            decoded = jwt.verify(session, JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }
        const userId = decoded.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not found in session' });
        }
        // Get current user's role
        const currentUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                // isActive removed: field not in schema
            }
        });
        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }
        // Get query parameters
        const { role, parentId } = req.query;
        // Get accessible roles for current user
        const accessibleRoles = (0, hierarchyUtils_1.getAccessibleRoles)(currentUser.role);
        // Build where clause
        let whereClause = {};
        // Filter by role if specified and accessible
        if (role && typeof role === 'string') {
            if (!accessibleRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: Cannot view ${role} users`
                });
            }
            whereClause.role = role;
        }
        else {
            // If no specific role requested, only show accessible roles
            whereClause.role = { in: accessibleRoles.map(r => r) };
        }
        // Filter by parentId if specified
        if (parentId && typeof parentId === 'string') {
            whereClause.parentId = parentId;
        }
        // No isActive field in schema
        // Get users with hierarchy information
        const users = await prisma_1.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                limit: true,
                createdAt: true,
                contactno: true,
                parentId: true,
                parent: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true
                    }
                },
                // _count removed
            },
            orderBy: [
                { role: 'asc' },
                { name: 'asc' }
            ]
        });
        // Add hierarchy level information
        const usersWithHierarchy = users.map((user) => ({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            creditLimit: user.limit,
            contactno: user.contactno,
            parentId: user.parentId,
            hierarchyLevel: accessibleRoles.indexOf(user.role),
            canManage: (0, hierarchyUtils_1.canAccessRole)(currentUser.role, user.role),
            directChildren: 0,
            totalChildren: 0
        }));
        return res.status(200).json({
            success: true,
            currentUser: {
                id: currentUser.id,
                role: currentUser.role
            },
            accessibleRoles,
            users: usersWithHierarchy,
            total: usersWithHierarchy.length
        });
    }
    catch (error) {
        console.error('Error in filtered users API:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
//# sourceMappingURL=filtered.js.map