-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('INPLAY', 'UPCOMING', 'COMPLETED', 'REMOVED', 'FINISHED');

-- CreateEnum
CREATE TYPE "BettingScope" AS ENUM ('MATCH', 'SESSION', 'CASINO');

-- CreateEnum
CREATE TYPE "MarketType" AS ENUM ('MATCH_WINNER', 'OVER_UNDER', 'HANDICAP', 'CORRECT_SCORE', 'BOTH_TEAMS_SCORE', 'FIRST_GOAL_SCORER');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SelectionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'WINNER', 'LOSER', 'VOID');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'VOID', 'CANCELED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "CasinoBetStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "contactno" TEXT,
    "reference" TEXT,
    "limit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exposure" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "casinoStatus" BOOLEAN,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casino_games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "cacheUrl" TEXT NOT NULL,
    "socketUrl" TEXT NOT NULL,
    "videoUrl1" TEXT NOT NULL,
    "videoUrl2" TEXT NOT NULL,
    "videoUrl3" TEXT,
    "minStake" INTEGER NOT NULL,
    "maxStake" INTEGER NOT NULL,
    "fetchDataType" TEXT NOT NULL DEFAULT 'socket',
    "videoUrlType" TEXT NOT NULL DEFAULT '1',
    "betStatus" BOOLEAN NOT NULL DEFAULT true,
    "casinoStatus" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT NOT NULL DEFAULT 'Game is under maintenance',
    "oddsDifference" TEXT NOT NULL DEFAULT '0.01',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casino_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "location" TEXT,
    "sessionDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_commission_shares" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "share" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cshare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "casinocommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchcommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessioncommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessionCommission" DOUBLE PRECISION,
    "session_commission_type" TEXT NOT NULL DEFAULT 'No Comm',
    "commissionType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "available_share_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "user_commission_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "externalMatchId" TEXT NOT NULL,
    "matchName" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL DEFAULT 'cricket',
    "bevent" TEXT NOT NULL,
    "bmarket" TEXT NOT NULL,
    "tournament" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "winner" TEXT,
    "settledAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_odds" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "gtype" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "scope" "BettingScope" NOT NULL DEFAULT 'MATCH',

    CONSTRAINT "match_odds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MarketType" NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scope" "BettingScope" NOT NULL DEFAULT 'MATCH',
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "selections" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "status" "SelectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT,
    "marketId" TEXT,
    "selectionId" TEXT,
    "selection" TEXT,
    "marketName" TEXT,
    "stake" DOUBLE PRECISION NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "betType" TEXT,
    "betCategory" "BettingScope" NOT NULL DEFAULT 'MATCH',
    "potentialWin" DOUBLE PRECISION,
    "status" "BetStatus" NOT NULL DEFAULT 'PENDING',
    "profitLoss" DOUBLE PRECISION,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "payout" DOUBLE PRECISION,
    "teamName" TEXT,
    "betMode" TEXT,
    "sessionDescription" TEXT,
    "targetValue" TEXT,
    "casinoGame" TEXT,
    "betDescription" TEXT,
    "roundId" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "notifications" JSONB NOT NULL DEFAULT '{"sms": false, "push": true, "email": true}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_items" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odds_history" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "selectionId" TEXT NOT NULL,
    "previousOdds" DOUBLE PRECISION NOT NULL,
    "newOdds" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "odds_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_selections" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_exposures" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_exposures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT,
    "marketId" TEXT,
    "betId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casino_tables" (
    "id" SERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "short_name" VARCHAR(20) NOT NULL,
    "bet_status" "CasinoBetStatus" NOT NULL DEFAULT 'OPEN',
    "min_stake" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_stake" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "data_url" TEXT,
    "result_url" TEXT,
    "stream_id" INTEGER,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "casino_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "ConfigType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "login_sessions_userId_idx" ON "login_sessions"("userId");

-- CreateIndex
CREATE INDEX "login_sessions_loginAt_idx" ON "login_sessions"("loginAt");

-- CreateIndex
CREATE INDEX "login_sessions_isActive_idx" ON "login_sessions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_commission_shares_userId_key" ON "user_commission_shares"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_externalMatchId_key" ON "matches"("externalMatchId");

-- CreateIndex
CREATE INDEX "matches_bmarket_idx" ON "matches"("bmarket");

-- CreateIndex
CREATE INDEX "matches_bevent_idx" ON "matches"("bevent");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_startTime_idx" ON "matches"("startTime");

-- CreateIndex
CREATE INDEX "matches_isLive_idx" ON "matches"("isLive");

-- CreateIndex
CREATE INDEX "matches_isActive_idx" ON "matches"("isActive");

-- CreateIndex
CREATE INDEX "match_odds_marketId_idx" ON "match_odds"("marketId");

-- CreateIndex
CREATE INDEX "match_odds_matchId_idx" ON "match_odds"("matchId");

-- CreateIndex
CREATE INDEX "match_odds_status_idx" ON "match_odds"("status");

-- CreateIndex
CREATE INDEX "bets_userId_idx" ON "bets"("userId");

-- CreateIndex
CREATE INDEX "bets_matchId_idx" ON "bets"("matchId");

-- CreateIndex
CREATE INDEX "bets_marketId_idx" ON "bets"("marketId");

-- CreateIndex
CREATE INDEX "bets_status_idx" ON "bets"("status");

-- CreateIndex
CREATE INDEX "bets_betCategory_idx" ON "bets"("betCategory");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "queue_items_queueName_idx" ON "queue_items"("queueName");

-- CreateIndex
CREATE INDEX "queue_items_status_idx" ON "queue_items"("status");

-- CreateIndex
CREATE INDEX "queue_items_priority_idx" ON "queue_items"("priority");

-- CreateIndex
CREATE INDEX "odds_history_marketId_idx" ON "odds_history"("marketId");

-- CreateIndex
CREATE INDEX "odds_history_selectionId_idx" ON "odds_history"("selectionId");

-- CreateIndex
CREATE INDEX "odds_history_timestamp_idx" ON "odds_history"("timestamp");

-- CreateIndex
CREATE INDEX "market_selections_marketId_idx" ON "market_selections"("marketId");

-- CreateIndex
CREATE INDEX "user_exposures_userId_idx" ON "user_exposures"("userId");

-- CreateIndex
CREATE INDEX "user_exposures_matchId_idx" ON "user_exposures"("matchId");

-- CreateIndex
CREATE INDEX "limits_userId_idx" ON "limits"("userId");

-- CreateIndex
CREATE INDEX "limits_type_idx" ON "limits"("type");

-- CreateIndex
CREATE INDEX "ledger_userId_idx" ON "ledger"("userId");

-- CreateIndex
CREATE INDEX "ledger_matchId_idx" ON "ledger"("matchId");

-- CreateIndex
CREATE INDEX "ledger_marketId_idx" ON "ledger"("marketId");

-- CreateIndex
CREATE INDEX "ledger_betId_idx" ON "ledger"("betId");

-- CreateIndex
CREATE INDEX "idx_casino_tables_bet_status" ON "casino_tables"("bet_status");

-- CreateIndex
CREATE INDEX "idx_casino_tables_stream_id" ON "casino_tables"("stream_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_commission_shares" ADD CONSTRAINT "user_commission_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_odds" ADD CONSTRAINT "match_odds_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selections" ADD CONSTRAINT "selections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_selectionId_fkey" FOREIGN KEY ("selectionId") REFERENCES "selections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exposures" ADD CONSTRAINT "user_exposures_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exposures" ADD CONSTRAINT "user_exposures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "limits" ADD CONSTRAINT "limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
