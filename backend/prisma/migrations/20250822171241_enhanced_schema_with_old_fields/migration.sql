/*
  Warnings:

  - The values [CANCELLED] on the enum `BetStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELLED] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[externalMatchId]` on the table `matches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bevent` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bmarket` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalMatchId` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `matches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchName` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CasinoBetStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "BetStatus_new" AS ENUM ('PENDING', 'WON', 'LOST', 'VOID', 'CANCELED');
ALTER TABLE "bets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bets" ALTER COLUMN "status" TYPE "BetStatus_new" USING ("status"::text::"BetStatus_new");
ALTER TYPE "BetStatus" RENAME TO "BetStatus_old";
ALTER TYPE "BetStatus_new" RENAME TO "BetStatus";
DROP TYPE "BetStatus_old";
ALTER TABLE "bets" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('UPCOMING', 'LIVE', 'CLOSED', 'COMPLETED', 'ABANDONED', 'CANCELED', 'OPEN', 'SUSPENDED', 'SETTLED', 'SCHEDULED', 'FINISHED', 'POSTPONED');
ALTER TABLE "matches" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "matches" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "MatchStatus_old";
ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUB_OWNER';
ALTER TYPE "UserRole" ADD VALUE 'SUB';
ALTER TYPE "UserRole" ADD VALUE 'MASTER';
ALTER TYPE "UserRole" ADD VALUE 'SUPER_AGENT';
ALTER TYPE "UserRole" ADD VALUE 'AGENT';
ALTER TYPE "UserRole" ADD VALUE 'OWNER';

-- DropIndex
DROP INDEX "matches_externalId_key";

-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "betType" TEXT,
ADD COLUMN     "profitLoss" DOUBLE PRECISION,
ADD COLUMN     "selection" TEXT,
ALTER COLUMN "selectionId" DROP NOT NULL,
ALTER COLUMN "potentialWin" DROP NOT NULL;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "bevent" TEXT NOT NULL,
ADD COLUMN     "bmarket" TEXT NOT NULL,
ADD COLUMN     "externalMatchId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "matchName" TEXT NOT NULL,
ADD COLUMN     "result" TEXT,
ADD COLUMN     "settledAt" TIMESTAMP(3),
ADD COLUMN     "teams" JSONB,
ADD COLUMN     "winner" TEXT,
ALTER COLUMN "sport" SET DEFAULT 'cricket',
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "casinoStatus" BOOLEAN,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "contactno" TEXT,
ADD COLUMN     "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "exposure" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mobileshare" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

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
    "icshare" DOUBLE PRECISION NOT NULL DEFAULT 0,
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
CREATE TABLE "match_odds" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "gtype" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "oddsData" JSONB NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_odds_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "login_sessions_userId_idx" ON "login_sessions"("userId");

-- CreateIndex
CREATE INDEX "login_sessions_loginAt_idx" ON "login_sessions"("loginAt");

-- CreateIndex
CREATE INDEX "login_sessions_isActive_idx" ON "login_sessions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_commission_shares_userId_key" ON "user_commission_shares"("userId");

-- CreateIndex
CREATE INDEX "match_odds_marketId_idx" ON "match_odds"("marketId");

-- CreateIndex
CREATE INDEX "match_odds_matchId_idx" ON "match_odds"("matchId");

-- CreateIndex
CREATE INDEX "match_odds_status_idx" ON "match_odds"("status");

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
CREATE INDEX "bets_userId_idx" ON "bets"("userId");

-- CreateIndex
CREATE INDEX "bets_matchId_idx" ON "bets"("matchId");

-- CreateIndex
CREATE INDEX "bets_marketId_idx" ON "bets"("marketId");

-- CreateIndex
CREATE INDEX "bets_status_idx" ON "bets"("status");

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

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_commission_shares" ADD CONSTRAINT "user_commission_shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_odds" ADD CONSTRAINT "match_odds_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
