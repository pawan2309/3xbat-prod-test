/**
 * Universal Casino Redis Publisher
 * Publishes game updates to Redis channels for all 6 casino games
 */
export declare class CasinoRedisPublisher {
    private redis;
    constructor(redis: any);
    /**
     * Publish game update to Redis channel for specific game
     */
    publishGameUpdate(gameType: string, gameData: any): Promise<void>;
    /**
     * Publish round result to Redis channel for specific game
     */
    publishRoundResult(gameType: string, result: any): Promise<void>;
    /**
     * Publish game state change to Redis channel for specific game
     */
    publishGameStateChange(gameType: string, changeType: string, data: any): Promise<void>;
    /**
     * Publish countdown update to Redis channel for specific game
     */
    publishCountdownUpdate(gameType: string, countdown: number, roundId: string): Promise<void>;
    /**
     * Publish betting odds update to Redis channel for specific game
     */
    publishOddsUpdate(gameType: string, odds: any): Promise<void>;
    /**
     * Publish game event to Redis channel for specific game
     */
    publishGameEvent(gameType: string, eventType: string, eventData: any): Promise<void>;
    /**
     * Publish to all casino channels (broadcast)
     */
    publishToAllGames(message: any): Promise<void>;
    /**
     * Get supported game types
     */
    getSupportedGameTypes(): string[];
    /**
     * Get channel name for specific game
     */
    getChannelName(gameType: string): string;
}
export default CasinoRedisPublisher;
//# sourceMappingURL=casinoRedisPublisher.d.ts.map