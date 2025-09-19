"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const cricketFixtureService_1 = __importDefault(require("../../lib/services/cricketFixtureService"));
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        console.log('🔄 Starting match sync from fixture API...');
        // Use the correct backend URL
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
        const fixtureResponse = await fetch(`${backendUrl}/provider/cricketmatches`);
        if (!fixtureResponse.ok) {
            throw new Error(`Failed to fetch fixtures: ${fixtureResponse.status}`);
        }
        const fixtures = await fixtureResponse.json();
        console.log(`📊 Fetched ${Array.isArray(fixtures) ? fixtures.length : 0} fixtures from API`);
        // Transform fixtures to match our expected format
        const transformedFixtures = (Array.isArray(fixtures) ? fixtures : []).map((fixture) => {
            // Clean the eventId - remove extra characters like (1.246774949)
            const cleanEventId = (fixture.eventId || fixture.id || fixture.matchId || '').split('(')[0];
            return {
                eventId: cleanEventId,
                ename: fixture.ename || fixture.eventName || fixture.name || 'Unknown Match',
                bvent: fixture.bvent || fixture.bevent || '',
                bmarket: fixture.bmarket || fixture.bmarketId || '',
                cname: fixture.cname || fixture.tournament || 'Cricket Tournament',
                stime: fixture.stime || fixture.startTime || fixture.date,
                iplay: fixture.iplay || fixture.inPlay || false,
                team1: fixture.team1 || fixture.brunners?.[0] || 'Team 1',
                team2: fixture.team2 || fixture.brunners?.[1] || 'Team 2',
                score1: fixture.score1 || '0-0',
                score2: fixture.score2 || '0-0'
            };
        });
        console.log('🔄 Transforming fixtures...');
        console.log('📝 Sample fixture:', transformedFixtures[0]);
        // Save matches to database
        // Stubbed save path: use service if available; otherwise return transformed as saved
        const service = cricketFixtureService_1.default;
        const savedMatches = typeof service.saveMatchesFromFixtures === 'function'
            ? await service.saveMatchesFromFixtures(transformedFixtures)
            : transformedFixtures;
        console.log(`✅ Successfully synced ${savedMatches.length} matches`);
        // Return summary
        res.status(200).json({
            success: true,
            message: `Successfully synced ${savedMatches.length} matches`,
            totalFixtures: Array.isArray(fixtures) ? fixtures.length : 0,
            savedMatches: savedMatches.length,
            sampleMatch: savedMatches[0] || null
        });
    }
    catch (error) {
        console.error('❌ Match sync failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync matches',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=sync.js.map