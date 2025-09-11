// Bet Types and Interfaces
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
  
  // Additional fields for table display
  teamName?: string;          // For MATCH BETS - TEAM column
  betMode?: string;           // For MODE column (back/lay)
  sessionDescription?: string; // For SESSION BETS - SESSION column
  targetValue?: string;       // For SESSION BETS - RUNS column
  casinoGame?: string;        // For CASINO BETS - CASINO column
  betDescription?: string;    // For CASINO BETS - NAME column
  roundId?: string;           // For CASINO BETS - ROUND ID column
  transactionId?: string;     // For CASINO BETS - TRANSACTION ID column
  status?: string;            // For STATUS column (PENDING/WON/LOST/VOID/CANCELED)
}

// Bet category configuration for extensibility
export interface BetCategoryConfig {
  type: BetType;
  keywords: string[];
  description: string;
  priority: number; // Higher number = higher priority for matching
}

// Bet placement result
export interface BetPlacementResult {
  success: boolean;
  betId?: string;
  betType: BetType;
  message: string;
  error?: string;
}

// Bet category matcher interface for extensibility
export interface BetCategoryMatcher {
  matches(bet: Bet): boolean;
  getType(): BetType;
  getPriority(): number;
}
