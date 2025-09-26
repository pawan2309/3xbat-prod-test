-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('INPLAY', 'UPCOMING', 'COMPLETED', 'REMOVED', 'FINISHED');

-- CreateEnum
CREATE TYPE "BettingScope" AS ENUM ('MATCH', 'SESSION', 'CASINO');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'VOID', 'CANCELED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

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
    "videoUrl1" TEXT NOT NULL,
    "minStake" INTEGER NOT NULL,
    "maxStake" INTEGER NOT NULL,
    "betStatus" BOOLEAN NOT NULL DEFAULT true,
    "casinoStatus" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT NOT NULL DEFAULT 'Game is under maintenance',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casino_games_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

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
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "queue_items_queueName_idx" ON "queue_items"("queueName");

-- CreateIndex
CREATE INDEX "queue_items_status_idx" ON "queue_items"("status");

-- CreateIndex
CREATE INDEX "queue_items_priority_idx" ON "queue_items"("priority");

-- CreateIndex
CREATE INDEX "ledger_userId_idx" ON "ledger"("userId");

-- CreateIndex
CREATE INDEX "ledger_matchId_idx" ON "ledger"("matchId");

-- CreateIndex
CREATE INDEX "ledger_marketId_idx" ON "ledger"("marketId");

-- CreateIndex
CREATE INDEX "ledger_betId_idx" ON "ledger"("betId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_commission_shares" ADD CONSTRAINT "user_commission_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
