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
            decoded = jwt.verify(session, process.env.JWT_SECRET || 'dev_secret');
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }
        const userId = decoded.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not found in session' });
        }
        // Get user details
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                role: true
            }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }
        // Get role-based access information
        const accessibleRoles = (0, hierarchyUtils_1.getAccessibleRoles)(user.role);
        const navigation = (0, hierarchyUtils_1.getRoleBasedNavigation)(user.role);
        // Check specific feature access
        const featureAccess = {
            login_reports: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'login_reports'),
            super_admin_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'super_admin_management'),
            admin_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'admin_management'),
            sub_owner_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'sub_owner_management'),
            sub_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'sub_management'),
            master_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'master_management'),
            super_agent_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'super_agent_management'),
            agent_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'agent_management'),
            client_management: (0, hierarchyUtils_1.canAccessFeature)(user.role, 'client_management'),
        };
        // Get accessible users by role (for hierarchy filtering)
        const accessibleUsersByRole = {};
        for (const role of accessibleRoles) {
            try {
                const users = await prisma_1.prisma.user.findMany({
                    where: {
                        role: role
                    },
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                });
                accessibleUsersByRole[role] = users;
            }
            catch (error) {
                console.error(`Error fetching users for role ${role}:`, error);
                accessibleUsersByRole[role] = [];
            }
        }
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            },
            access: {
                accessibleRoles,
                navigation,
                featureAccess,
                accessibleUsersByRole
            }
        });
    }
    catch (error) {
        console.error('Error in role-access API:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
//# sourceMappingURL=role-access.js.map