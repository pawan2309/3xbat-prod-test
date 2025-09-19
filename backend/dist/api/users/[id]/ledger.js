"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    try {
        const ledger = await prisma_1.prisma.ledger.findMany({
            where: {
                userId: id,
                type: {
                    in: [
                        'DEPOSIT',
                        'WITHDRAWAL',
                        'LIMIT_UPDATE',
                        'ADJUSTMENT',
                        'SETTLEMENT',
                    ],
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ success: true, ledger });
    }
    catch (error) {
        console.error('Error fetching ledger:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
//# sourceMappingURL=ledger.js.map