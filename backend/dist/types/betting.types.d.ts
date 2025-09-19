export type BetType = "match" | "session";
export interface Bet {
    id: string;
    userId: string;
    matchId?: string;
    marketId?: string;
    marketName: string;
    odds: number;
    stake: number;
    betType?: BetType;
    createdAt?: Date;
    teamName?: string;
    betMode?: string;
    sessionDescription?: string;
    targetValue?: string;
    casinoGame?: string;
    betDescription?: string;
    roundId?: string;
    transactionId?: string;
    status?: string;
}
export interface BetCategoryConfig {
    type: BetType;
    keywords: string[];
    description: string;
    priority: number;
}
export interface BetPlacementResult {
    success: boolean;
    betId?: string;
    betType: BetType;
    message: string;
    error?: string;
}
export interface BetCategoryMatcher {
    matches(bet: Bet): boolean;
    getType(): BetType;
    getPriority(): number;
}
//# sourceMappingURL=betting.types.d.ts.map