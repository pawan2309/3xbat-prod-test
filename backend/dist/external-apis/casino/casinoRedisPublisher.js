"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasinoRedisPublisher = void 0;
const logger_1 = require("../../monitoring/logging/logger");
/**
 * Universal Casino Redis Publisher
 * Publishes game updates to Redis channels for all 6 casino games
 */
class CasinoRedisPublisher {
    constructor(redis) {
        this.redis = redis;
    }
    /**
     * Publish game update to Redis channel for specific game
     */
    async publishGameUpdate(gameType, gameData) {
        try {
            const channel = `casino_${gameType}`;
            // 🔧 DEBUG: Log the exact data being sent
            console.log(`🎰 Publishing game update for ${gameType}`);
            console.log(`🎰 GameData structure:`, JSON.stringify(gameData, null, 2));
            const message = JSON.stringify({
                gameType,
                gameData,
                timestamp: Date.now()
            });
            await this.redis.publish(channel, message);
            (0, logger_1.logInfo)(`🎰 Published game update for ${gameType}`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish game update for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Publish round result to Redis channel for specific game
     */
    async publishRoundResult(gameType, result) {
        try {
            const channel = `casino_${gameType}`;
            const message = JSON.stringify({
                gameType,
                type: 'result',
                result,
                timestamp: Date.now()
            });
            await this.redis.publish(channel, message);
            (0, logger_1.logInfo)(`🎰 Published round result for ${gameType}`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish round result for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Publish game state change to Redis channel for specific game
     */
    async publishGameStateChange(gameType, changeType, data) {
        try {
            const channel = `casino_${gameType}`;
            const message = JSON.stringify({
                gameType,
                type: 'stateChange',
                changeType,
                data,
                timestamp: Date.now()
            });
            await this.redis.publish(channel, message);
            (0, logger_1.logInfo)(`🎰 Published ${changeType} for ${gameType}`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish ${changeType} for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Publish countdown update to Redis channel for specific game
     */
    async publishCountdownUpdate(gameType, countdown, roundId) {
        try {
            const channel = `casino_${gameType}`;
            const message = JSON.stringify({
                gameType,
                type: 'countdown',
                countdown,
                roundId,
                timestamp: Date.now()
            });
            await this.redis.publish(channel, message);
            (0, logger_1.logInfo)(`🎰 Published countdown update for ${gameType}: ${countdown}s`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish countdown update for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Publish betting odds update to Redis channel for specific game
     */
    async publishOddsUpdate(gameType, odds) {
        try {
            const channel = `casino_${gameType}`;
            const message = JSON.stringify({
                gameType,
                type: 'odds',
                odds,
                timestamp: Date.now()
            });
            await this.redis.publish(channel, message);
            (0, logger_1.logInfo)(`🎰 Published odds update for ${gameType}`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish odds update for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Publish game event to Redis channel for specific game
     */
    async publishGameEvent(gameType, eventType, eventData) {
        try {
            const channel = `casino_${gameType}`;
            const message = JSON.stringify({
                gameType,
                type: 'gameEvent',
                eventType,
                data: eventData,
                timestamp: Date.now()
            });
            await this.redis.publish(channel, message);
            (0, logger_1.logInfo)(`🎰 Published game event ${eventType} for ${gameType}`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish game event ${eventType} for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Publish to all casino channels (broadcast)
     */
    async publishToAllGames(message) {
        try {
            const gameTypes = ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'];
            for (const gameType of gameTypes) {
                const channel = `casino_${gameType}`;
                await this.redis.publish(channel, JSON.stringify({
                    ...message,
                    gameType,
                    timestamp: Date.now()
                }));
            }
            (0, logger_1.logInfo)(`🎰 Published broadcast message to all casino games`);
        }
        catch (error) {
            (0, logger_1.logError)(`❌ Failed to publish broadcast message:`, error);
            throw error;
        }
    }
    /**
     * Get supported game types
     */
    getSupportedGameTypes() {
        return ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'];
    }
    /**
     * Get channel name for specific game
     */
    getChannelName(gameType) {
        return `casino_${gameType}`;
    }
}
exports.CasinoRedisPublisher = CasinoRedisPublisher;
exports.default = CasinoRedisPublisher;
//# sourceMappingURL=casinoRedisPublisher.js.map