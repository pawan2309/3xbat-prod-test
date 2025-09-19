"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const cricketFixtureService_1 = __importDefault(require("../../lib/services/cricketFixtureService"));
const client_1 = require("@prisma/client");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { status, live } = req.query;
        let fixtures;
        if (live === 'true') {
            // Get live fixtures
            fixtures = await new cricketFixtureService_1.default().getFixtures();
        }
        else if (status && Object.values(client_1.MatchStatus).includes(status)) {
            // Get fixtures by specific status
            fixtures = await new cricketFixtureService_1.default().getFixtures();
        }
        else {
            // Get all active fixtures
            fixtures = await new cricketFixtureService_1.default().getFixtures();
        }
        console.log(`✅ API: Retrieved ${fixtures.length} fixtures from database`);
        res.status(200).json({
            success: true,
            count: fixtures.length,
            fixtures: fixtures
        });
    }
    catch (error) {
        console.error('❌ API: Error retrieving fixtures:', error);
        res.status(500).json({
            error: 'Failed to retrieve fixtures',
            details: error?.message || 'Unknown error'
        });
    }
}
//# sourceMappingURL=get-fixtures.js.map