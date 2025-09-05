# Market Classification Implementation Guide

## Overview

This implementation enhances your betting system to properly classify markets by scope (session vs match) and store comprehensive betting data that matches the table structure shown in your image. The system now automatically distinguishes between:

- **Match Markets**: Overall match outcomes (e.g., "MATCH_ODDS", "Tied Match")
- **Session Markets**: Time/period specific markets (e.g., "25 over run NK", "P YASHOVARDHAN RUN")

## What's New

### 1. Enhanced Database Schema

#### Bet Table New Fields
```sql
-- Market Classification
marketType     MarketType?   -- MATCH_WINNER, SESSION, CASINO, FANCY, TOSS, BOOKMAKER, TIED_MATCH, CUSTOM
marketScope    MarketScope?  -- MATCH or SESSION
marketName     String?       -- Actual market name from API
sessionName    String?       -- Session-specific name for session markets
teamName       String?       -- Team names for match markets

-- Enhanced Odds Tracking
oddsType       String?       -- 'bookmaker', 'toss', etc.
oddsSnapshot   Json?         -- Complete odds data when bet was placed
oddsTier       Int?          -- Which tier of odds (1=best, 2=second best, etc.)
availableStake Float?        -- Available stake at that odds level

-- Financial Tracking
wonAmount      Float?        -- Amount won if bet is successful
lostAmount     Float?        -- Amount lost if bet fails
result         String?       -- Final result of the bet

-- Market Metadata
gtype          String?       -- Store the gtype from API
minStake       Float?        -- Minimum stake for this market
maxStake       Float?        -- Maximum stake for this market
```

#### Match Table New Fields
```sql
eventName      String?       -- Event name from API
apiSource      String?       -- API source (e.g., 'shamexch.xyz')
matchType      String?       -- Match type from API
isInPlay       Boolean?      -- In-play status from API
```

### 2. New Enums
```typescript
enum MarketType {
  MATCH_WINNER
  SESSION
  CASINO
  FANCY
  TOSS
  BOOKMAKER
  TIED_MATCH
  CUSTOM
}

enum MarketScope {
  MATCH
  SESSION
}
```

## Implementation Steps

### Step 1: Run Database Migration

```bash
cd user-management/apps/frontend

# Option 1: Run the migration script
node scripts/run-market-classification-migration.js

# Option 2: Run SQL directly
psql -d your_database -f scripts/add-market-classification-fields.sql
```

### Step 2: Update Your Bet Placement Logic

Replace your existing bet placement with the enhanced service:

```typescript
import betService, { EnhancedBetData } from '../lib/betService';

// When placing a bet, include market data
const betData: EnhancedBetData = {
  userId: 'USE0001',
  matchId: '34622065',
  marketId: 'market_id',
  selection: 'Northern Knights',
  stake: 1000,
  odds: 6.0,
  betType: 'back',
  
  // Include the market data from your API response
  marketData: {
    mname: 'MATCH_ODDS',
    gtype: 'match',
    section: [
      {
        nat: 'Northern Knights',
        odds: [{ otype: 'back', odds: 6.0, size: 8.97 }]
      },
      {
        nat: 'Leinster Lightning', 
        odds: [{ otype: 'back', odds: 1.17, size: 225.99 }]
      }
    ]
  },
  
  // Additional metadata
  oddsSnapshot: oddsData,
  oddsTier: 1,
  availableStake: 8.97,
  minStake: 100,
  maxStake: 2000
};

// Place the bet
const result = await betService.placeBet(betData);
```

### Step 3: Market Classification Logic

The system automatically classifies markets using the `classifyMarketByScope` function:

```typescript
// Example: Match Market
{
  mname: 'MATCH_ODDS',
  gtype: 'match'
}
// Result: marketType: 'MATCH_WINNER', marketScope: 'MATCH'

// Example: Session Market  
{
  mname: '25 over run NK',
  gtype: 'fancy'
}
// Result: marketType: 'SESSION', marketScope: 'SESSION', sessionName: '25 over run NK'
```

## Data Structure for Your Table

### Match Markets Table (Top Section)
```typescript
interface MatchMarketBet {
  srNo: number;
  odds: number;
  oddsType: 'bookmaker' | 'toss';
  amount: number;
  type: 'Khai' | 'Lagai';
  marketId: string;
  team: string;        // e.g., "MYSORE WARRIORS"
  client: string;
  date: Date;
  loss: number;
  profit: number;
}
```

### Session Markets Table (Bottom Section)
```typescript
interface SessionMarketBet {
  srNo: number;
  odds: number;
  amount: number;
  type: 'Khai' | 'Lagai';
  marketId: string;
  sessionName: string; // e.g., "20 OVER RUNS GL"
  client: string;
  date: Date;
  loss: number;
  profit: number;
}
```

## Querying Data for Display

### Get All Bets with Classification
```typescript
import betService from '../lib/betService';

// Get all bets
const allBets = await betService.getBetsWithClassification();

// Get only match market bets
const matchBets = await betService.getBetsWithClassification({
  marketScope: 'MATCH'
});

// Get only session market bets
const sessionBets = await betService.getBetsWithClassification({
  marketScope: 'SESSION'
});

// Get specific market type bets
const casinoBets = await betService.getBetsWithClassification({
  marketType: 'CASINO'
});
```

### Using the Database View
```typescript
// The migration creates a view for easy querying
const betData = await prisma.$queryRaw`
  SELECT * FROM "BetMarketClassification"
  WHERE "marketScope" = 'MATCH'
  ORDER BY "createdAt" DESC
`;
```

## Integration with Existing Code

### 1. Update Your Bet Placement API
```typescript
// In your bet placement route
router.post('/api/bet', async (req, res) => {
  try {
    const { userId, matchId, marketId, selection, stake, odds, betType, marketData } = req.body;
    
    const betData: EnhancedBetData = {
      userId,
      matchId,
      marketId,
      selection,
      stake,
      odds,
      betType,
      marketData, // Include the market data from your odds API
      oddsSnapshot: req.body.oddsSnapshot,
      oddsTier: req.body.oddsTier,
      availableStake: req.body.availableStake,
      minStake: req.body.minStake,
      maxStake: req.body.maxStake
    };
    
    const result = await betService.placeBet(betData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 2. Update Your Frontend Bet Placement
```typescript
// In your BetSlip component
const handleConfirm = async () => {
  if (!bet) return;
  
  try {
    // Get the market data from your odds API response
    const marketData = {
      mname: bet.marketName,
      gtype: 'match', // or get from API
      section: [] // populate from API
    };
    
    const betData: EnhancedBetData = {
      userId: user.username,
      matchId: bet.matchId,
      marketId: bet.marketId,
      selection: bet.selectionName,
      stake: stake,
      odds: bet.odds,
      betType: bet.type,
      marketData,
      oddsSnapshot: currentOddsData,
      oddsTier: 1,
      availableStake: bet.availableStake,
      minStake: 100,
      maxStake: 500000
    };
    
    const result = await betService.placeBet(betData);
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  } catch (error) {
    // Handle error
  }
};
```

## Benefits

1. **Automatic Classification**: Markets are automatically classified as session or match
2. **Rich Data Storage**: Store complete odds snapshots and market metadata
3. **Easy Filtering**: Query bets by market scope, type, or other criteria
4. **Audit Trail**: Complete tracking of odds when bets were placed
5. **Flexible Display**: Support for both match and session market tables
6. **Type Safety**: Full TypeScript support with enums

## Testing

### Test Market Classification
```typescript
import { classifyMarketByScope } from '../lib/marketClassifier';

// Test match market
const matchMarket = {
  mname: 'MATCH_ODDS',
  gtype: 'match'
};
console.log(classifyMarketByScope(matchMarket));
// Output: { marketType: 'MATCH_WINNER', marketScope: 'MATCH', ... }

// Test session market
const sessionMarket = {
  mname: '25 over run NK',
  gtype: 'fancy'
};
console.log(classifyMarketByScope(sessionMarket));
// Output: { marketType: 'SESSION', marketScope: 'SESSION', sessionName: '25 over run NK', ... }
```

### Test Bet Placement
```typescript
import betService from '../lib/betService';

const testBet = await betService.placeBet({
  // ... test data
});

console.log('Bet placed:', testBet);
```

## Troubleshooting

### Common Issues

1. **Migration Fails**: Ensure your database user has ALTER TABLE permissions
2. **Type Errors**: Run `npx prisma generate` after schema changes
3. **Missing Fields**: Check that all required fields are populated in betData
4. **Classification Issues**: Verify market data structure matches expected format

### Validation

After implementation, verify:
- New fields exist in database
- Market classification works correctly
- Bets are stored with proper scope and type
- Queries return expected results

## Next Steps

1. **Run the migration** to add new fields
2. **Update your bet placement** to use the enhanced service
3. **Test with sample data** to verify classification
4. **Update your UI** to display the new table structure
5. **Monitor performance** and add indexes if needed

This implementation provides a solid foundation for distinguishing between session and match markets while maintaining all your existing functionality. 