import { logInfo, logError } from '../../monitoring/logging/logger';

/**
 * Universal Casino Redis Publisher
 * Publishes game updates to Redis channels for all 6 casino games
 */
export class CasinoRedisPublisher {
  private redis: any;

  constructor(redis: any) {
    this.redis = redis;
  }

  /**
   * Publish game update to Redis channel for specific game
   */
  async publishGameUpdate(gameType: string, gameData: any) {
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
      logInfo(`🎰 Published game update for ${gameType}`);
    } catch (error) {
      logError(`❌ Failed to publish game update for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Publish round result to Redis channel for specific game
   */
  async publishRoundResult(gameType: string, result: any) {
    try {
      const channel = `casino_${gameType}`;
      
      const message = JSON.stringify({
        gameType,
        type: 'result',
        result,
        timestamp: Date.now()
      });
      
      await this.redis.publish(channel, message);
      logInfo(`🎰 Published round result for ${gameType}`);
    } catch (error) {
      logError(`❌ Failed to publish round result for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Publish game state change to Redis channel for specific game
   */
  async publishGameStateChange(gameType: string, changeType: string, data: any) {
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
      logInfo(`🎰 Published ${changeType} for ${gameType}`);
    } catch (error) {
      logError(`❌ Failed to publish ${changeType} for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Publish countdown update to Redis channel for specific game
   */
  async publishCountdownUpdate(gameType: string, countdown: number, roundId: string) {
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
      logInfo(`🎰 Published countdown update for ${gameType}: ${countdown}s`);
    } catch (error) {
      logError(`❌ Failed to publish countdown update for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Publish betting odds update to Redis channel for specific game
   */
  async publishOddsUpdate(gameType: string, odds: any) {
    try {
      const channel = `casino_${gameType}`;
      
      const message = JSON.stringify({
        gameType,
        type: 'odds',
        odds,
        timestamp: Date.now()
      });
      
      await this.redis.publish(channel, message);
      logInfo(`🎰 Published odds update for ${gameType}`);
    } catch (error) {
      logError(`❌ Failed to publish odds update for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Publish game event to Redis channel for specific game
   */
  async publishGameEvent(gameType: string, eventType: string, eventData: any) {
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
      logInfo(`🎰 Published game event ${eventType} for ${gameType}`);
    } catch (error) {
      logError(`❌ Failed to publish game event ${eventType} for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Publish to all casino channels (broadcast)
   */
  async publishToAllGames(message: any) {
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
      
      logInfo(`🎰 Published broadcast message to all casino games`);
    } catch (error) {
      logError(`❌ Failed to publish broadcast message:`, error);
      throw error;
    }
  }

  /**
   * Get supported game types
   */
  getSupportedGameTypes(): string[] {
    return ['teen20', 'ab20', 'dt20', 'aaa', 'card32eu', 'lucky7eu'];
  }

  /**
   * Get channel name for specific game
   */
  getChannelName(gameType: string): string {
    return `casino_${gameType}`;
  }
}

export default CasinoRedisPublisher;
