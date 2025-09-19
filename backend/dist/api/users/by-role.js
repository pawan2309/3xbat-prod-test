"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtime = void 0;
const prisma_1 = require("../../lib/prisma");
exports.runtime = 'nodejs';
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        const { role } = req.query;
        console.log('🔍 by-role endpoint called with role:', role);
        if (!role || typeof role !== 'string') {
            return res.status(400).json({ success: false, message: 'Role parameter is required' });
        }
        // Map old role names to new role names for backward compatibility
        const roleMapping = {
            'SUPER_ADMIN': 'SUP_ADM',
            'SUB_OWNER': 'SUB_OWN',
            'SUB_ADMIN': 'SUB_ADM',
            'MASTER': 'MAS_AGENT',
            'SUPER_AGENT': 'SUP_AGENT'
        };
        const mappedRole = roleMapping[role] || role;
        console.log('🔍 Mapped role:', mappedRole);
        const users = await prisma_1.prisma.user.findMany({
            where: {
                role: mappedRole,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                status: true,
                contactno: true,
                parentId: true,
                createdAt: true,
                parent: {
                    select: {
                        username: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`🔍 Found ${users.length} users with role ${mappedRole}`);
        // Transform users to match the expected format for the modal
        const transformedUsers = users.map(user => ({
            id: user.id,
            label: `${user.username} - ${user.name}`,
            value: user.id,
            username: user.username,
            name: user.name,
            code: user.username // Using username as code
        }));
        console.log(`✅ Returning ${transformedUsers.length} transformed users`);
        return res.status(200).json({ success: true, users: transformedUsers });
    }
    catch (error) {
        console.error('❌ Error fetching users by role:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch users by role', error: error.message });
    }
}
exports.default = handler;
//# sourceMappingURL=by-role.js.map