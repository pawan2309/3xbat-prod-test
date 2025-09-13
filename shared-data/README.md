# 3xBat Shared Data Services

A comprehensive shared data services layer for 3xBat applications, providing consistent API access, data management, and real-time updates across all frontend applications.

## Overview

This package provides:
- **Unified API Services** for matches, bets, users, casino games, and dashboard data
- **React Hooks** for easy data fetching and state management
- **WebSocket Integration** for real-time updates
- **TypeScript Support** with full type definitions
- **Utility Functions** for formatting, validation, and data manipulation
- **Consistent Error Handling** across all services

## Installation

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Development mode with watch
npm run dev
```

## Usage

### Basic Setup

```typescript
import { MatchService, useMatches, useWebSocket } from '@3xbat/shared-data';

// Using services directly
const matchService = new MatchService();
const matches = await matchService.getMatches();

// Using React hooks
function MatchesComponent() {
  const { matches, loading, error, refetch } = useMatches({
    autoRefresh: true,
    refreshInterval: 30000
  });

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {matches.map(match => (
        <div key={match.id}>{match.matchName}</div>
      ))}
    </div>
  );
}
```

### Available Services

#### MatchService
```typescript
import { MatchService } from '@3xbat/shared-data';

const matchService = new MatchService();

// Get all matches
const matches = await matchService.getMatches();

// Get live matches
const liveMatches = await matchService.getLiveMatches();

// Get matches by series
const seriesMatches = await matchService.getMatchesBySeries('ODI Series 2024');

// Create a new match
const newMatch = await matchService.createMatch({
  matchName: 'India vs Australia',
  date: '2024-01-15',
  time: '14:30',
  status: 'UPCOMING',
  venue: 'Melbourne Cricket Ground',
  series: 'ODI Series 2024'
});
```

#### BetService
```typescript
import { BetService } from '@3xbat/shared-data';

const betService = new BetService();

// Get all bets
const bets = await betService.getBets();

// Get user bets
const userBets = await betService.getUserBets('user123');

// Place a bet
const newBet = await betService.placeBet({
  userId: 'user123',
  marketName: 'Match Winner',
  odds: 1.85,
  stake: 100,
  matchId: 'match123'
});

// Update bet status
await betService.updateBetStatus('bet123', 'WON', 'India');
```

#### UserService
```typescript
import { UserService } from '@3xbat/shared-data';

const userService = new UserService();

// Get all users
const users = await userService.getUsers();

// Get user by ID
const user = await userService.getUserById('user123');

// Create a new user
const newUser = await userService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  name: 'John Doe',
  password: 'securePassword123'
});

// Update user status
await userService.updateUserStatus('user123', 'SUSPENDED');
```

#### CasinoService
```typescript
import { CasinoService } from '@3xbat/shared-data';

const casinoService = new CasinoService();

// Get all casino games
const games = await casinoService.getCasinoGames();

// Get active games
const activeGames = await casinoService.getActiveCasinoGames();

// Create a new game
const newGame = await casinoService.createCasinoGame({
  gameName: 'Diamond Roulette',
  gameType: 'Roulette',
  status: 'ACTIVE',
  minBet: 10,
  maxBet: 5000,
  houseEdge: 2.7
});

// Start a game
await casinoService.startCasinoGame('game123');
```

### React Hooks

#### useMatches
```typescript
import { useMatches, useLiveMatches, useUpcomingMatches } from '@3xbat/shared-data';

function MatchesComponent() {
  // Basic usage
  const { matches, loading, error, refetch } = useMatches();

  // Live matches with auto-refresh
  const { matches: liveMatches } = useLiveMatches();

  // Upcoming matches
  const { matches: upcomingMatches } = useUpcomingMatches();

  // With filters
  const { matches: filteredMatches } = useMatches({
    filters: { status: 'LIVE', series: 'ODI Series 2024' },
    autoRefresh: true,
    refreshInterval: 10000
  });

  return (
    <div>
      <h2>Live Matches ({liveMatches.length})</h2>
      {liveMatches.map(match => (
        <div key={match.id}>{match.matchName}</div>
      ))}
    </div>
  );
}
```

#### useBets
```typescript
import { useBets, useUserBets, usePendingBets } from '@3xbat/shared-data';

function BetsComponent() {
  // All bets
  const { bets, loading, error, placeBet, updateBetStatus } = useBets();

  // User-specific bets
  const { bets: userBets } = useUserBets('user123');

  // Pending bets with auto-refresh
  const { bets: pendingBets } = usePendingBets();

  const handlePlaceBet = async () => {
    await placeBet({
      userId: 'user123',
      marketName: 'Match Winner',
      odds: 1.85,
      stake: 100,
      matchId: 'match123'
    });
  };

  return (
    <div>
      <button onClick={handlePlaceBet}>Place Bet</button>
      {pendingBets.map(bet => (
        <div key={bet.id}>
          {bet.marketName} - {bet.status}
        </div>
      ))}
    </div>
  );
}
```

#### useWebSocket
```typescript
import { useWebSocket } from '@3xbat/shared-data';

function RealTimeComponent() {
  const {
    isConnected,
    connect,
    disconnect,
    subscribeToMatchUpdates,
    subscribeToBetUpdates,
    lastMessage
  } = useWebSocket();

  useEffect(() => {
    connect();
    subscribeToMatchUpdates('match123');
    subscribeToBetUpdates('user123');

    return () => {
      disconnect();
    };
  }, []);

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {lastMessage && (
        <div>Last update: {lastMessage.type}</div>
      )}
    </div>
  );
}
```

### Utility Functions

#### Formatters
```typescript
import { 
  formatCurrency, 
  formatDate, 
  formatBetStatus, 
  formatMatchStatus 
} from '@3xbat/shared-data';

// Format currency
const amount = formatCurrency(1250.50); // "$1,250.50"

// Format date
const date = formatDate('2024-01-15', 'long'); // "Monday, January 15, 2024"

// Format status with styling
const betStatus = formatBetStatus('WON'); 
// { text: 'Won', className: 'text-green-600 bg-green-100' }
```

#### Validators
```typescript
import { 
  isValidEmail, 
  isValidPassword, 
  isValidBetAmount 
} from '@3xbat/shared-data';

// Validate email
const isEmailValid = isValidEmail('user@example.com'); // true

// Validate password
const passwordValidation = isValidPassword('password123');
// { isValid: false, errors: ['Password must contain at least one uppercase letter'] }

// Validate bet amount
const betValidation = isValidBetAmount(100, 1, 10000);
// { isValid: true, errors: [] }
```

#### Helpers
```typescript
import { 
  debounce, 
  deepClone, 
  generateId, 
  formatLargeNumber 
} from '@3xbat/shared-data';

// Debounce function
const debouncedSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

// Deep clone object
const clonedObject = deepClone(originalObject);

// Generate unique ID
const id = generateId(); // "abc123def456"

// Format large numbers
const formatted = formatLargeNumber(1500000); // "1.5M"
```

## Configuration

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# For production
NEXT_PUBLIC_API_URL=https://api.3xbat.com
NEXT_PUBLIC_WS_URL=wss://ws.3xbat.com
```

### Custom Configuration

```typescript
import { MatchService } from '@3xbat/shared-data';

// Custom API base URL
const matchService = new MatchService('https://custom-api.com/api');

// Or use environment-specific config
import { getApiConfig } from '@3xbat/shared-data';
const config = getApiConfig();
```

## Error Handling

All services include comprehensive error handling:

```typescript
import { SharedDataError } from '@3xbat/shared-data';

try {
  const matches = await matchService.getMatches();
} catch (error) {
  if (error instanceof SharedDataError) {
    console.error('API Error:', error.code, error.message);
    console.error('Details:', error.details);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { Match, Bet, User, ApiResponse } from '@3xbat/shared-data';

interface CustomMatch extends Match {
  customField: string;
}

const response: ApiResponse<Match[]> = await matchService.getMatches();
```

## Contributing

1. Make changes to the source code
2. Run tests: `npm test`
3. Build the package: `npm run build`
4. Update documentation as needed

## License

MIT License - see LICENSE file for details.
