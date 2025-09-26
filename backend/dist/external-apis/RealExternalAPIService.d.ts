export default class RealExternalAPIService {
    private cricketBaseUrl;
    private casinoBaseUrl;
    private timeout;
    private retryAttempts;
    private userAgent;
    constructor();
    /**
     * Test external API connection health
     */
    testExternalAPIConnection(): Promise<boolean>;
    /**
     * Get health status of all external APIs
     */
    getHealthStatus(): Promise<{
        externalAPI: string;
        timestamp: string;
    }>;
    getCricketScorecard(marketId: string): Promise<unknown>;
    getCricketTV(eventId: string): Promise<any>;
    getCricketFixtures(): Promise<unknown>;
    getCricketOdds(eventId: string): Promise<unknown>;
    /**
     * Get casino TV streaming data
     */
    getCasinoTV(streamId: string): Promise<unknown>;
    /**
     * Get casino game data
     */
    getCasinoGameData(gameType: string): Promise<unknown>;
    /**
     * Get casino game results
     */
    getCasinoGameResults(gameType: string): Promise<unknown>;
    /**
     * Get all casino game data
     */
    getAllCasinoGameData(): Promise<unknown>;
    /**
     * Get all casino game results
     */
    getAllCasinoGameResults(): Promise<unknown>;
}
//# sourceMappingURL=RealExternalAPIService.d.ts.map