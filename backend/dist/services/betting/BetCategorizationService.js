"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betCategorizationService = exports.BetCategorizationService = exports.MatchBetMatcher = exports.SessionBetMatcher = void 0;
exports.categorizeBet = categorizeBet;
// Default bet category configurations with comprehensive cricket betting keywords
const DEFAULT_BET_CATEGORIES = [
    {
        type: "session",
        keywords: [
            // Over/Under markets
            "over", "under", "total", "runs", "wickets", "fours", "sixes", "extras",
            "session", "ball", "run", "wicket", "four", "six", "extra",
            // Session-specific terms
            "first", "last", "powerplay", "death", "slog", "boundary", "boundaries",
            "dot", "dots", "maiden", "maidens", "wide", "wides", "no ball", "noball",
            // Time-based sessions
            "10", "15", "20", "overs", "inning", "innings", "phase", "period",
            // Player performance
            "batsman", "bowler", "player", "individual", "performance",
            // Specific cricket terms
            "duck", "century", "fifty", "hundred", "double", "triple",
            "hat", "trick", "strike", "rate", "economy", "average",
            // Additional session terms
            "fall", "caught", "bowled", "lbw", "run out", "stumped",
            "clean", "hit", "dismissal", "dismissals"
        ],
        description: "Session-based betting markets",
        priority: 1
    },
    {
        type: "match",
        keywords: [
            "winner", "match", "outright", "result", "toss", "tie", "draw",
            "win", "lose", "abandoned", "no result", "cancelled",
            // Tournament/Series terms
            "tournament", "series", "league", "cup", "championship", "final",
            "semi", "quarter", "playoff", "knockout",
            // Team/Player terms
            "team", "squad", "captain", "vice", "captaincy",
            // Match-specific terms
            "man of the match", "mom", "player of the match", "pom"
        ],
        description: "Match result betting markets",
        priority: 2
    }
];
// Individual category matcher classes for extensibility
class SessionBetMatcher {
    constructor(keywords = [
        "over", "under", "total", "runs", "wickets", "fours", "sixes", "extras",
        "session", "ball", "run", "wicket", "four", "six", "extra",
        "first", "last", "powerplay", "death", "slog", "boundary", "boundaries",
        "dot", "dots", "maiden", "maidens", "wide", "wides", "no ball", "noball",
        "10", "15", "20", "overs", "inning", "innings", "phase", "period",
        "batsman", "bowler", "player", "individual", "performance",
        "duck", "century", "fifty", "hundred", "double", "triple",
        "hat", "trick", "strike", "rate", "economy", "average",
        "fall", "caught", "bowled", "lbw", "run out", "stumped",
        "clean", "hit", "dismissal", "dismissals"
    ]) {
        this.keywords = keywords;
    }
    matches(bet) {
        return this.keywords.some(keyword => bet.marketName.toLowerCase().includes(keyword.toLowerCase()));
    }
    getType() {
        return "session";
    }
    getPriority() {
        return 1;
    }
}
exports.SessionBetMatcher = SessionBetMatcher;
class MatchBetMatcher {
    constructor(keywords = [
        "winner", "match", "outright", "result", "toss", "tie", "draw",
        "win", "lose", "abandoned", "no result", "cancelled",
        "tournament", "series", "league", "cup", "championship", "final",
        "semi", "quarter", "playoff", "knockout",
        "team", "squad", "captain", "vice", "captaincy",
        "man of the match", "mom", "player of the match", "pom"
    ]) {
        this.keywords = keywords;
    }
    matches(bet) {
        return this.keywords.some(keyword => bet.marketName.toLowerCase().includes(keyword.toLowerCase()));
    }
    getType() {
        return "match";
    }
    getPriority() {
        return 2;
    }
}
exports.MatchBetMatcher = MatchBetMatcher;
// Main categorization service
class BetCategorizationService {
    constructor(customMatchers) {
        // Initialize with default matchers or custom ones
        this.matchers = customMatchers || [
            new SessionBetMatcher(),
            new MatchBetMatcher()
        ];
        // Sort by priority (higher priority first)
        this.matchers.sort((a, b) => b.getPriority() - a.getPriority());
    }
    /**
     * Categorize a bet based on market name
     * @param bet - The bet to categorize
     * @returns The determined bet type
     */
    categorizeBet(bet) {
        // Find all matchers that match the bet
        const matchingMatchers = this.matchers.filter(matcher => matcher.matches(bet));
        if (matchingMatchers.length === 0) {
            // Default to match bet if no specific category matches
            return "match";
        }
        // If multiple matchers match, prioritize by priority (higher number = higher priority)
        // This ensures that more specific keywords take precedence
        const bestMatcher = matchingMatchers.reduce((best, current) => current.getPriority() > best.getPriority() ? current : best);
        return bestMatcher.getType();
    }
    /**
     * Add a new category matcher
     * @param matcher - The new matcher to add
     */
    addMatcher(matcher) {
        this.matchers.push(matcher);
        // Re-sort by priority
        this.matchers.sort((a, b) => b.getPriority() - a.getPriority());
    }
    /**
     * Remove a category matcher by type
     * @param type - The bet type to remove
     */
    removeMatcher(type) {
        this.matchers = this.matchers.filter(matcher => matcher.getType() !== type);
    }
    /**
     * Get all available bet types
     * @returns Array of available bet types
     */
    getAvailableTypes() {
        return [...new Set(this.matchers.map(matcher => matcher.getType()))];
    }
    /**
     * Get category configuration
     * @returns Array of category configurations
     */
    getCategoryConfigs() {
        return this.matchers.map(matcher => ({
            type: matcher.getType(),
            keywords: [], // This would need to be exposed by matchers
            description: `${matcher.getType()} betting markets`,
            priority: matcher.getPriority()
        }));
    }
}
exports.BetCategorizationService = BetCategorizationService;
// Default service instance
exports.betCategorizationService = new BetCategorizationService();
// Convenience function for backward compatibility
function categorizeBet(bet) {
    return exports.betCategorizationService.categorizeBet(bet);
}
//# sourceMappingURL=BetCategorizationService.js.map