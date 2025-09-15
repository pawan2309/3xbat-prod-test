import { MarketType, MarketScope } from './types';

export interface MarketData {
  mname: string;
  gtype: string;
  section?: any[];
  [key: string]: any;
}

export interface MarketClassification {
  marketType: MarketType;
  marketScope: MarketScope;
  marketName: string;
  sessionName?: string;
  teamName?: string;
  oddsType?: string;
}

/**
 * Classify market by scope to determine if it's session-based or match-based
 * This function analyzes the market data to properly categorize betting markets
 */
export function classifyMarketByScope(market: MarketData): MarketClassification {
  const mname = market.mname?.toLowerCase() || '';
  const gtype = market.gtype?.toLowerCase() || '';
  
  // Initialize default values
  let marketType: MarketType = MarketType.CUSTOM;
  let marketScope: MarketScope = MarketScope.MATCH;
  let sessionName: string | undefined;
  let teamName: string | undefined;
  let oddsType: string | undefined;
  
  // Determine odds type based on market characteristics
  if (mname === 'match_odds') {
    oddsType = 'bookmaker';
  } else if (mname === 'tied match') {
    oddsType = 'toss';
  } else if (mname === 'bookmaker') {
    oddsType = 'bookmaker';
  }
  
  // Session markets - time/period specific
  if (mname.includes('over run') ||      // "25 over run NK"
      mname.includes('fall of') ||       // "Fall of 7th wkt NK"  
      mname.includes('player run') ||    // "C Carmichael run"
      mname.includes('over by over') ||  // "Over By Over"
      mname.includes('ball') ||          // "1 TO 45 BALLS RUN"
      mname.includes('session')) {       // Session-based markets
    
    marketType = MarketType.SESSION;
    marketScope = MarketScope.SESSION;
    
    // Extract session name and team name
    if (mname.includes('over run')) {
      sessionName = market.mname; // e.g., "25 over run NK"
      // Extract team name from the end (last 2-3 characters)
      const teamMatch = mname.match(/([a-z]{2,3})$/);
      if (teamMatch) {
        teamName = teamMatch[1].toUpperCase();
      }
    } else if (mname.includes('player run')) {
      sessionName = market.mname; // e.g., "P YASHOVARDHAN RUN"
    } else if (mname.includes('ball')) {
      sessionName = market.mname; // e.g., "1 TO 45 BALLS RUN WF W"
    }
    
  } else if (mname === 'match_odds' ||         // "MATCH_ODDS"
             mname === 'tied match' ||          // "Tied Match"
             mname === 'bookmaker') {           // "Bookmaker"
    
    marketType = MarketType.MATCH_WINNER;
    marketScope = MarketScope.MATCH;
    
    // For match markets, team names come from the section data
    if (market.section && Array.isArray(market.section)) {
      const teamNames = market.section.map((sec: any) => sec.nat).filter(Boolean);
      if (teamNames.length > 0) {
        teamName = teamNames.join(' vs ');
      }
    }
    
  } else if (mname.includes('inn') ||           // "1ST INN 20 OVER"
             mname === 'oddeven' ||             // "oddeven"
             mname.includes('number')) {        // Number markets
    
    marketType = MarketType.CASINO;
    marketScope = MarketScope.SESSION;
    sessionName = market.mname;
    
  } else if (mname === 'normal') {             // "Normal"
    
    marketType = MarketType.FANCY;
    marketScope = MarketScope.SESSION;
    sessionName = market.mname;
    
  } else if (gtype === 'fancy') {
    
    marketType = MarketType.FANCY;
    marketScope = MarketScope.SESSION;
    sessionName = market.mname;
    
  } else if (gtype === 'cricketcasino') {
    
    marketType = MarketType.CASINO;
    marketScope = MarketScope.SESSION;
    sessionName = market.mname;
    
  } else if (gtype === 'match' || gtype === 'match1') {
    
    marketType = MarketType.MATCH_WINNER;
    marketScope = MarketScope.MATCH;
    
    // Extract team names from section data
    if (market.section && Array.isArray(market.section)) {
      const teamNames = market.section.map((sec: any) => sec.nat).filter(Boolean);
      if (teamNames.length > 0) {
        teamName = teamNames.join(' vs ');
      }
    }
  }
  
  return {
    marketType,
    marketScope,
    marketName: market.mname,
    sessionName,
    teamName,
    oddsType
  };
}

/**
 * Helper function to get display name for market type
 */
export function getMarketTypeDisplayName(marketType: MarketType): string {
  switch (marketType) {
    case MarketType.MATCH_WINNER:
      return 'Match Winner';
    case MarketType.SESSION:
      return 'Session';
    case MarketType.CASINO:
      return 'Casino';
    case MarketType.FANCY:
      return 'Fancy';
    case MarketType.TOSS:
      return 'Toss';
    case MarketType.BOOKMAKER:
      return 'Bookmaker';
    case MarketType.TIED_MATCH:
      return 'Tied Match';
    default:
      return 'Custom';
  }
}

/**
 * Helper function to get display name for market scope
 */
export function getMarketScopeDisplayName(marketScope: MarketScope): string {
  switch (marketScope) {
    case MarketScope.MATCH:
      return 'Match';
    case MarketScope.SESSION:
      return 'Session';
    default:
      return 'Unknown';
  }
} 