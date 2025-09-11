# Betting System Documentation

## Overview

This betting system provides a modular and extensible architecture for handling different types of bets in a cricket betting platform. The system automatically categorizes bets as either "Match Bets" or "Session Bets" based on market names and saves them to separate database tables.

## Architecture

### Core Components

1. **BetCategorizationService** - Handles bet categorization logic
2. **BetPlacementService** - Manages bet placement and routing
3. **BetHandler Classes** - Individual handlers for each bet type
4. **Database Models** - Separate tables for different bet types

### Key Features

- ✅ **Automatic Categorization** - Bets are automatically categorized based on market names
- ✅ **Modular Design** - Easy to add new bet types and handlers
- ✅ **Type Safety** - Full TypeScript support with proper interfaces
- ✅ **Extensible** - Simple to add new bet categories in the future
- ✅ **Validation** - Comprehensive bet data validation
- ✅ **Logging** - Detailed logging for debugging and monitoring
- ✅ **Statistics** - Built-in bet statistics and reporting

## Usage Examples

### Basic Bet Placement

```typescript
import { betPlacementService } from './services/betting/BetPlacementService';

const bet = {
  id: 'bet-123',
  userId: 'user-456',
  marketName: 'Over 150 Runs',
  odds: 1.85,
  stake: 100
};

const result = await betPlacementService.placeBet(bet);
console.log(result); // { success: true, betId: 'uuid', betType: 'session', message: '...' }
```

### API Endpoints

#### Place a Bet
```bash
POST /api/betting/place
Content-Type: application/json

{
  "userId": "user-123",
  "marketName": "Over 150 Runs",
  "odds": 1.85,
  "stake": 100
}
```

#### Get Bet Statistics
```bash
GET /api/betting/stats/user-123?type=session
```

#### Test Categorization
```bash
POST /api/betting/categorize
Content-Type: application/json

{
  "marketName": "Over 150 Runs"
}
```

## Bet Categorization Rules

### Session Bets
Markets containing these keywords are categorized as session bets:
- "Over", "Session", "Ball", "Runs", "Wickets", "Fours", "Sixes", "Extras"

Examples:
- "Over 150 Runs" → Session Bet
- "Session Total Wickets" → Session Bet
- "Ball by Ball Runs" → Session Bet

### Match Bets
Markets containing these keywords are categorized as match bets:
- "Winner", "Match", "Outright", "Result"

Examples:
- "Match Winner" → Match Bet
- "Outright Winner" → Match Bet
- "Match Result" → Match Bet

## Adding New Bet Categories

### 1. Create a New Handler

```typescript
class LiveBetHandler extends BetHandler {
  async handle(bet: Bet): Promise<BetPlacementResult> {
    // Implementation for live bets
  }

  getType(): BetType {
    return "live";
  }
}
```

### 2. Add to BetCategorizationService

```typescript
const liveMatcher = new LiveBetMatcher(["Live", "In-Play", "Real-time"]);
betCategorizationService.addMatcher(liveMatcher);
```

### 3. Register with BetPlacementService

```typescript
betPlacementService.registerHandler(new LiveBetHandler(prisma));
```

### 4. Update Database Schema

```prisma
// Add new bet category to BettingScope enum
enum BettingScope {
  MATCH
  SESSION
  LIVE  // New category
}
```

The system uses the unified `bets` table, so no new tables are needed. Just add the new category to the enum and update the categorization logic.

## Database Schema

### Updated Bet Table
The system uses the existing `bets` table with enhanced fields for categorization:

```sql
-- Enhanced bets table with new fields
ALTER TABLE bets ADD COLUMN market_name VARCHAR;
ALTER TABLE bets RENAME COLUMN scope TO bet_category;
CREATE INDEX idx_bets_bet_category ON bets(bet_category);
```

### Bet Model Structure
```prisma
model Bet {
  id                String       @id @default(cuid())
  userId            String
  matchId           String
  marketId          String
  marketName        String?      // Added for better categorization
  stake             Float
  odds              Float
  betType           String?      // Keep for backward compatibility
  betCategory       BettingScope @default(MATCH) // Renamed from scope
  potentialWin      Float?
  status            BetStatus    @default(PENDING)
  // ... other existing fields
}
```

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors** - Invalid bet data
- **Database Errors** - Connection or query failures
- **Categorization Errors** - Unknown bet types
- **Handler Errors** - Specific handler failures

## Monitoring and Logging

All bet placements are logged with:
- User ID
- Market name
- Bet type
- Odds and stake
- Success/failure status
- Error messages (if any)

## Future Enhancements

- **Bet Settlement** - Automatic bet settlement based on match results
- **Commission Calculation** - Different commission rates for different bet types
- **Risk Management** - Bet limits and exposure tracking
- **Analytics** - Advanced betting analytics and reporting
- **Notifications** - Real-time bet status notifications
