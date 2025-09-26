"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../config/environment");
const logger_1 = __importDefault(require("../monitoring/logging/logger"));
const retryUtils_1 = __importDefault(require("../utils/retryUtils"));
class RealExternalAPIService {
    constructor() {
        this.cricketBaseUrl = environment_1.externalAPIConfig.cricket.baseUrl;
        this.casinoBaseUrl = environment_1.externalAPIConfig.casino.baseUrl;
        this.timeout = environment_1.externalAPIConfig.cricket.timeout;
        this.retryAttempts = environment_1.externalAPIConfig.cricket.retryAttempts;
        this.userAgent = '3xbat-backend/1.0.0';
    }
    /**
     * Test external API connection health
     */
    async testExternalAPIConnection() {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.cricketBaseUrl}/cricketmatches`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: 2, // Quick health check, don't retry too much
                baseDelay: 500,
                maxDelay: 2000
            });
            return response.ok;
        }
        catch (error) {
            logger_1.default.error('❌ External API connection test failed:', error);
            return false;
        }
    }
    /**
     * Get health status of all external APIs
     */
    async getHealthStatus() {
        try {
            const externalAPIStatus = await this.testExternalAPIConnection();
            return {
                externalAPI: externalAPIStatus ? 'healthy' : 'down',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            logger_1.default.error('❌ Health check failed:', error);
            return {
                externalAPI: 'error',
                timestamp: new Date().toISOString(),
            };
        }
    }
    // ==================== CRICKET API METHODS ====================
    async getCricketScorecard(marketId) {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.cricketBaseUrl}/cricket/scorecard?marketId=${marketId}`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch cricket scorecard:', error);
            throw error;
        }
    }
    async getCricketTV(eventId) {
        try {
            // Call external API directly instead of through proxy
            const response = await retryUtils_1.default.fetchWithRetry(`https://mis3.sqmr.xyz/rtv.php?eventId=${eventId}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://3xbat.com',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'DNT': '1',
                    'Upgrade-Insecure-Requests': '1'
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 2000,
                maxDelay: 15000
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            // Check if response is JSON or HTML
            const contentType = response.headers.get('content-type');
            let tvData;
            if (contentType && contentType.includes('application/json')) {
                tvData = await response.json();
            }
            else {
                // Handle HTML response
                const htmlContent = await response.text();
                tvData = {
                    html: htmlContent,
                    contentType: contentType || 'text/html',
                    message: 'TV stream data returned as HTML'
                };
            }
            return tvData;
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch cricket TV:', error);
            throw error;
        }
    }
    async getCricketFixtures() {
        try {
            // Call external API directly instead of through proxy
            const response = await retryUtils_1.default.fetchWithRetry('https://marketsarket.qnsports.live/cricketmatches', {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch cricket fixtures:', error);
            throw error;
        }
    }
    async getCricketOdds(eventId) {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.cricketBaseUrl}/cricket/odds?eventId=${eventId}`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 500, // Faster retry for odds (more frequent updates)
                maxDelay: 5000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch cricket odds:', error);
            throw error;
        }
    }
    // ==================== CASINO API METHODS ====================
    /**
     * Get casino TV streaming data
     */
    async getCasinoTV(streamId) {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.casinoBaseUrl}/casino/tv?id=${streamId}`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch casino TV:', error);
            throw error;
        }
    }
    /**
     * Get casino game data
     */
    async getCasinoGameData(gameType) {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.casinoBaseUrl}/casino/data/${gameType}`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch casino game data for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Get casino game results
     */
    async getCasinoGameResults(gameType) {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.casinoBaseUrl}/casino/results/${gameType}`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error(`❌ Failed to fetch casino game results for ${gameType}:`, error);
            throw error;
        }
    }
    /**
     * Get all casino game data
     */
    async getAllCasinoGameData() {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.casinoBaseUrl}/casino/data`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch all casino game data:', error);
            throw error;
        }
    }
    /**
     * Get all casino game results
     */
    async getAllCasinoGameResults() {
        try {
            const response = await retryUtils_1.default.fetchWithRetry(`${this.casinoBaseUrl}/casino/results`, {
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                },
                signal: AbortSignal.timeout(this.timeout),
            }, {
                maxAttempts: this.retryAttempts,
                baseDelay: 1000,
                maxDelay: 10000
            });
            return await response.json();
        }
        catch (error) {
            logger_1.default.error('❌ Failed to fetch all casino game results:', error);
            throw error;
        }
    }
}
exports.default = RealExternalAPIService;
//# sourceMappingURL=RealExternalAPIService.js.map