import { PrismaClient } from "@prisma/client";
import { Bet, BetType, BetPlacementResult } from "../../types/betting.types";
declare abstract class BetHandler {
    protected prisma: PrismaClient;
    constructor(prisma: PrismaClient);
    abstract handle(bet: Bet): Promise<BetPlacementResult>;
    abstract getType(): BetType;
}
export declare class BetPlacementService {
    private handlers;
    private prisma;
    constructor(prisma?: PrismaClient);
    /**
     * Register a new bet handler
     * @param handler - The bet handler to register
     */
    registerHandler(handler: BetHandler): void;
    /**
     * Place a bet by categorizing it and routing to appropriate handler
     * @param bet - The bet to place
     * @returns Promise<BetPlacementResult>
     */
    placeBet(bet: Bet): Promise<BetPlacementResult>;
    /**
     * Validate bet data before placement
     * @param bet - The bet to validate
     * @returns Validation result
     */
    private validateBet;
    /**
     * Get available bet types
     * @returns Array of available bet types
     */
    getAvailableBetTypes(): BetType[];
    /**
     * Get bet statistics for a user
     * @param userId - The user ID
     * @param betType - Optional bet type filter
     * @returns Promise with bet statistics
     */
    getBetStatistics(userId: string, betType?: BetType): Promise<any>;
}
export declare const betPlacementService: BetPlacementService;
export declare function placeBet(bet: Bet): Promise<BetPlacementResult>;
export {};
//# sourceMappingURL=BetPlacementService.d.ts.map