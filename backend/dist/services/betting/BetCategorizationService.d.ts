import { Bet, BetType, BetCategoryConfig, BetCategoryMatcher } from '../../types/betting.types';
export declare class SessionBetMatcher implements BetCategoryMatcher {
    private keywords;
    constructor(keywords?: string[]);
    matches(bet: Bet): boolean;
    getType(): BetType;
    getPriority(): number;
}
export declare class MatchBetMatcher implements BetCategoryMatcher {
    private keywords;
    constructor(keywords?: string[]);
    matches(bet: Bet): boolean;
    getType(): BetType;
    getPriority(): number;
}
export declare class BetCategorizationService {
    private matchers;
    constructor(customMatchers?: BetCategoryMatcher[]);
    /**
     * Categorize a bet based on market name
     * @param bet - The bet to categorize
     * @returns The determined bet type
     */
    categorizeBet(bet: Bet): BetType;
    /**
     * Add a new category matcher
     * @param matcher - The new matcher to add
     */
    addMatcher(matcher: BetCategoryMatcher): void;
    /**
     * Remove a category matcher by type
     * @param type - The bet type to remove
     */
    removeMatcher(type: BetType): void;
    /**
     * Get all available bet types
     * @returns Array of available bet types
     */
    getAvailableTypes(): BetType[];
    /**
     * Get category configuration
     * @returns Array of category configurations
     */
    getCategoryConfigs(): BetCategoryConfig[];
}
export declare const betCategorizationService: BetCategorizationService;
export declare function categorizeBet(bet: Bet): BetType;
//# sourceMappingURL=BetCategorizationService.d.ts.map