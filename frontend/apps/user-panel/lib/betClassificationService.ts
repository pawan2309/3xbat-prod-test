import { MarketType, MarketScope } from '@prisma/client';

export interface MarketData {
  mname?: string;        // Market name from API
  gtype?: string;        // Game type from API (match, fancy, cricketcasino, etc.)
  section?: any[];       // Section data from API
  selection?: string;    // What user is betting on
}

export interface MarketClassification {
  marketType: MarketType;
  marketScope: MarketScope;
  marketName: string;
  sessionName?: string;
  teamName?: string;
  oddsType: string;
}

export class BetClassificationService {
  
  /**
   * Classify market based on API data to determine if it's MATCH or SESSION level
   */
  static classifyMarket(marketData: MarketData): MarketClassification {
    const { mname, gtype, section, selection } = marketData;
    
    // Default values
    let marketType: MarketType = MarketType.CUSTOM;
    let marketScope: MarketScope = MarketScope.MATCH;
    let marketName = mname || 'UNKNOWN_MARKET';
    let sessionName: string | undefined;
    let teamName: string | undefined;
    let oddsType = 'bookmaker';
    
    // Determine market type based on gtype
    if (gtype === 'cricketcasino') {
      marketType = MarketType.CASINO;
      marketScope = MarketScope.MATCH;
    } else if (gtype === 'fancy') {
      marketType = MarketType.FANCY;
      marketScope = MarketScope.MATCH;
    } else if (gtype === 'toss') {
      marketType = MarketType.TOSS;
      marketScope = MarketScope.MATCH;
    } else if (gtype === 'match') {
      // This is the key logic - determine if it's match winner or session
      if (this.isSessionMarket(mname, selection)) {
        marketType = MarketType.SESSION;
        marketScope = MarketScope.SESSION;
        sessionName = this.extractSessionName(mname, selection);
        teamName = this.extractTeamName(mname, selection);
      } else {
        marketType = MarketType.MATCH_WINNER;
        marketScope = MarketScope.MATCH;
      }
    }
    
    // Determine odds type
    if (gtype === 'toss') {
      oddsType = 'toss';
    } else if (gtype === 'cricketcasino') {
      oddsType = 'casino';
    } else if (gtype === 'fancy') {
      oddsType = 'fancy';
    }
    
    return {
      marketType,
      marketScope,
      marketName,
      sessionName,
      teamName,
      oddsType
    };
  }
  
  /**
   * Determine if market is session-based (not match winner)
   */
  private static isSessionMarket(mname?: string, selection?: string): boolean {
    if (!mname) return false;
    
    const marketName = mname.toLowerCase();
    const selectionText = selection?.toLowerCase() || '';
    
    // Session indicators
    const sessionIndicators = [
      'over runs', 'under runs', 'runs', 'wickets', 'fours', 'sixes',
      'total', 'extras', 'byes', 'leg byes', 'wide balls', 'no balls',
      'maiden overs', 'powerplay', 'super over', 'tie breaker',
      'first ball', 'last ball', 'first over', 'last over',
      'innings', 'chase', 'defend', 'bat first', 'bowl first'
    ];
    
    // Check if market name contains session indicators
    const hasSessionIndicator = sessionIndicators.some(indicator => 
      marketName.includes(indicator)
    );
    
    // Check if selection is not a team name (team names usually don't contain numbers)
    const hasNumericSelection = /\d/.test(selectionText);
    
    // Check if it's a specific over or innings
    const isSpecificOver = /^\d+\.?\d*$/.test(selectionText) || 
                          /^\d+\s*(over|ball|inning)/i.test(selectionText);
    
    return hasSessionIndicator || hasNumericSelection || isSpecificOver;
  }
  
  /**
   * Extract session name from market data
   */
  private static extractSessionName(mname?: string, selection?: string): string | undefined {
    if (!mname) return undefined;
    
    // Extract session info from market name
    const sessionMatch = mname.match(/(\d+\s*(?:OVER|BALL|INNING|RUNS?|WICKETS?))/i);
    if (sessionMatch) {
      return sessionMatch[1];
    }
    
    // Extract from selection if it's numeric
    if (selection && /\d/.test(selection)) {
      return selection;
    }
    
    return undefined;
  }
  
  /**
   * Extract team name from market data (if available)
   */
  private static extractTeamName(mname?: string, selection?: string): string | undefined {
    if (!mname) return undefined;
    
    // Look for team indicators in market name
    const teamMatch = mname.match(/([A-Z\s]+(?:WARRIORS|BRAVE|TEAM|XI|UNITED|STARS|LIONS|EAGLES|TIGERS|PANTHERS|KNIGHTS|ROYALS|CHAMPIONS|HEROES|LEGENDS|GIANTS|DRAGONS|PHOENIX))/i);
    if (teamMatch) {
      return teamMatch[1].trim();
    }
    
    // Check if selection is a team name
    if (selection && /[A-Z]/.test(selection) && selection.length > 3) {
      return selection;
    }
    
    return undefined;
  }
  
  /**
   * Get commission rate based on market classification
   * 
   * IMPORTANT: Commission is NOT applied during bet placement
   * Commission is applied ONLY during bet settlement when calculating profit/loss
   * 
   * Bet Placement Flow:
   * 1. User places bet with original odds (no commission)
   * 2. System saves bet with market classification
   * 3. User's stake is deducted, odds remain unchanged
   * 
   * Bet Settlement Flow:
   * 1. When bet result is declared
   * 2. Calculate actual profit/loss with original odds
   * 3. Apply commission to winnings only
   * 4. User receives: (Original Winnings - Commission)
   */
  static getCommissionRate(classification: MarketClassification): number {
    switch (classification.marketType) {
      case MarketType.CASINO:
        return 0.05; // 5% for casino
      case MarketType.FANCY:
        return 0.03; // 3% for fancy
      case MarketType.SESSION:
        return 0.02; // 2% for session bets
      case MarketType.MATCH_WINNER:
        return 0.01; // 1% for match winner
      case MarketType.TOSS:
        return 0.01; // 1% for toss
      default:
        return 0.01; // Default 1%
    }
  }
  
  /**
   * Validate market classification
   */
  static validateClassification(classification: MarketClassification): boolean {
    return !!(
      classification.marketType &&
      classification.marketScope &&
      classification.marketName &&
      classification.oddsType
    );
  }
} 