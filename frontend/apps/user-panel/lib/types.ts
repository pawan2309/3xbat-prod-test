// Local type definitions for user-panel
// These match the backend Prisma schema

export enum UserRole {
  OWNER = 'OWNER',
  SUB_OWN = 'SUB_OWN',
  SUP_ADM = 'SUP_ADM',
  ADMIN = 'ADMIN',
  SUB_ADM = 'SUB_ADM',
  MAS_AGENT = 'MAS_AGENT',
  SUP_AGENT = 'SUP_AGENT',
  AGENT = 'AGENT',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum MatchStatus {
  INPLAY = 'INPLAY',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  REMOVED = 'REMOVED',
  FINISHED = 'FINISHED'
}

export enum BettingScope {
  MATCH = 'MATCH',
  SESSION = 'SESSION',
  CASINO = 'CASINO'
}

export enum MarketType {
  MATCH_WINNER = 'MATCH_WINNER',
  OVER_UNDER = 'OVER_UNDER',
  HANDICAP = 'HANDICAP',
  CORRECT_SCORE = 'CORRECT_SCORE',
  BOTH_TEAMS_SCORE = 'BOTH_TEAMS_SCORE',
  FIRST_GOAL_SCORER = 'FIRST_GOAL_SCORER',
  CUSTOM = 'CUSTOM',
  CASINO = 'CASINO',
  FANCY = 'FANCY',
  TOSS = 'TOSS',
  SESSION = 'SESSION',
  BOOKMAKER = 'BOOKMAKER',
  TIED_MATCH = 'TIED_MATCH'
}

export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED'
}

export enum SelectionStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  WINNER = 'WINNER',
  LOSER = 'LOSER',
  VOID = 'VOID'
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  VOID = 'VOID',
  CANCELED = 'CANCELED'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum QueueStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum GameStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum CasinoBetStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum ConfigType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON'
}

// User Commission Share interface (matches schema)
export interface userCommissionShare {
  id: string;
  userId: string;
  share: number;
  cshare: number;
  casinocommission: number;
  matchcommission: number;
  sessioncommission: number;
  session_commission_type: string;
  commissionType?: string;
  available_share_percent: number;
  createdAt: Date;
  updatedAt: Date;
}

// User interface (matches schema)
export interface User {
  id: string;
  username: string;
  password: string;
  name: string | null;
  contactno: string | null;
  reference: string | null;
  limit: number;
  exposure: number;
  casinoStatus: boolean | null;
  role: UserRole;
  status: UserStatus;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userCommissionShare?: userCommissionShare | null;
  parent?: User | null;
  children?: User[];
}

// Alias for backward compatibility
export type Role = UserRole;

// MarketScope enum for value usage
export enum MarketScope {
  MATCH = 'MATCH',
  SESSION = 'SESSION',
  CASINO = 'CASINO'
}
