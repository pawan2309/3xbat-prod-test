"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.betPlacementService = exports.BetPlacementService = void 0;
exports.placeBet = placeBet;
const client_1 = require("@prisma/client");
const BetCategorizationService_1 = require("./BetCategorizationService");
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
const prisma = new client_1.PrismaClient();
// Abstract base class for bet handlers
class BetHandler {
    constructor(prisma) {
        this.prisma = prisma;
    }
}
// Match bet handler
class MatchBetHandler extends BetHandler {
    async handle(bet) {
        try {
            const matchBet = await this.prisma.bet.create({
                data: {
                    userId: bet.userId,
                    matchId: bet.matchId || null, // Optional field
                    marketId: bet.marketId || null, // Optional field - set to null instead of placeholder
                    marketName: bet.marketName,
                    odds: bet.odds,
                    stake: bet.stake,
                    betCategory: 'MATCH',
                    betType: bet.betType || 'match',
                    potentialWin: bet.odds * bet.stake,
                },
            });
            logger_1.default.info(`Match bet placed successfully: ${matchBet.id}`, {
                userId: bet.userId,
                marketName: bet.marketName,
                odds: bet.odds,
                stake: bet.stake
            });
            return {
                success: true,
                betId: matchBet.id,
                betType: "match",
                message: "Match bet placed successfully"
            };
        }
        catch (error) {
            logger_1.default.error("Failed to place match bet:", error);
            return {
                success: false,
                betType: "match",
                message: "Failed to place match bet",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }
    getType() {
        return "match";
    }
}
// Session bet handler
class SessionBetHandler extends BetHandler {
    async handle(bet) {
        try {
            const sessionBet = await this.prisma.bet.create({
                data: {
                    userId: bet.userId,
                    matchId: bet.matchId || null, // Optional field
                    marketId: bet.marketId || null, // Optional field - set to null instead of placeholder
                    marketName: bet.marketName,
                    odds: bet.odds,
                    stake: bet.stake,
                    betCategory: 'SESSION',
                    betType: bet.betType || 'session',
                    potentialWin: bet.odds * bet.stake,
                },
            });
            logger_1.default.info(`Session bet placed successfully: ${sessionBet.id}`, {
                userId: bet.userId,
                marketName: bet.marketName,
                odds: bet.odds,
                stake: bet.stake
            });
            return {
                success: true,
                betId: sessionBet.id,
                betType: "session",
                message: "Session bet placed successfully"
            };
        }
        catch (error) {
            logger_1.default.error("Failed to place session bet:", error);
            return {
                success: false,
                betType: "session",
                message: "Failed to place session bet",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }
    getType() {
        return "session";
    }
}
// Main bet placement service
class BetPlacementService {
    constructor(prisma = new client_1.PrismaClient()) {
        this.prisma = prisma;
        this.handlers = new Map();
        // Register default handlers
        this.registerHandler(new MatchBetHandler(prisma));
        this.registerHandler(new SessionBetHandler(prisma));
    }
    /**
     * Register a new bet handler
     * @param handler - The bet handler to register
     */
    registerHandler(handler) {
        this.handlers.set(handler.getType(), handler);
        logger_1.default.info(`Registered bet handler for type: ${handler.getType()}`);
    }
    /**
     * Place a bet by categorizing it and routing to appropriate handler
     * @param bet - The bet to place
     * @returns Promise<BetPlacementResult>
     */
    async placeBet(bet) {
        try {
            // Categorize the bet
            const betType = BetCategorizationService_1.betCategorizationService.categorizeBet(bet);
            // Set the bet type on the bet object
            bet.betType = betType;
            // Get the appropriate handler
            const handler = this.handlers.get(betType);
            if (!handler) {
                logger_1.default.error(`No handler found for bet type: ${betType}`);
                return {
                    success: false,
                    betType,
                    message: `No handler found for bet type: ${betType}`,
                    error: `Unsupported bet type: ${betType}`
                };
            }
            // Validate bet data
            const validationResult = this.validateBet(bet);
            if (!validationResult.valid) {
                return {
                    success: false,
                    betType,
                    message: "Bet validation failed",
                    error: validationResult.error
                };
            }
            // Place the bet using the appropriate handler
            const result = await handler.handle(bet);
            // Log the bet placement
            logger_1.default.info(`Bet placement attempted:`, {
                userId: bet.userId,
                marketName: bet.marketName,
                betType,
                success: result.success,
                betId: result.betId
            });
            return result;
        }
        catch (error) {
            logger_1.default.error("Error in bet placement service:", error);
            return {
                success: false,
                betType: bet.betType || "match",
                message: "Internal error during bet placement",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }
    /**
     * Validate bet data before placement
     * @param bet - The bet to validate
     * @returns Validation result
     */
    validateBet(bet) {
        if (!bet.userId || bet.userId.trim() === "") {
            return { valid: false, error: "User ID is required" };
        }
        if (!bet.marketName || bet.marketName.trim() === "") {
            return { valid: false, error: "Market name is required" };
        }
        if (!bet.odds || bet.odds <= 0) {
            return { valid: false, error: "Valid odds are required" };
        }
        if (!bet.stake || bet.stake <= 0) {
            return { valid: false, error: "Valid stake amount is required" };
        }
        return { valid: true };
    }
    /**
     * Get available bet types
     * @returns Array of available bet types
     */
    getAvailableBetTypes() {
        return Array.from(this.handlers.keys());
    }
    /**
     * Get bet statistics for a user
     * @param userId - The user ID
     * @param betType - Optional bet type filter
     * @returns Promise with bet statistics
     */
    async getBetStatistics(userId, betType) {
        try {
            const stats = {};
            if (!betType || betType === "match") {
                const matchBets = await this.prisma.bet.findMany({
                    where: {
                        userId,
                        betCategory: 'MATCH'
                    },
                    select: {
                        id: true,
                        marketName: true,
                        odds: true,
                        stake: true,
                        createdAt: true,
                        status: true
                    }
                });
                stats.matchBets = {
                    count: matchBets.length,
                    totalStake: matchBets.reduce((sum, bet) => sum + bet.stake, 0),
                    averageOdds: matchBets.length > 0 ? matchBets.reduce((sum, bet) => sum + bet.odds, 0) / matchBets.length : 0,
                    bets: matchBets
                };
            }
            if (!betType || betType === "session") {
                const sessionBets = await this.prisma.bet.findMany({
                    where: {
                        userId,
                        betCategory: 'SESSION'
                    },
                    select: {
                        id: true,
                        marketName: true,
                        odds: true,
                        stake: true,
                        createdAt: true,
                        status: true
                    }
                });
                stats.sessionBets = {
                    count: sessionBets.length,
                    totalStake: sessionBets.reduce((sum, bet) => sum + bet.stake, 0),
                    averageOdds: sessionBets.length > 0 ? sessionBets.reduce((sum, bet) => sum + bet.odds, 0) / sessionBets.length : 0,
                    bets: sessionBets
                };
            }
            return stats;
        }
        catch (error) {
            logger_1.default.error("Error getting bet statistics:", error);
            throw error;
        }
    }
}
exports.BetPlacementService = BetPlacementService;
// Default service instance
exports.betPlacementService = new BetPlacementService();
// Convenience function for backward compatibility
async function placeBet(bet) {
    return exports.betPlacementService.placeBet(bet);
}
//# sourceMappingURL=BetPlacementService.js.map