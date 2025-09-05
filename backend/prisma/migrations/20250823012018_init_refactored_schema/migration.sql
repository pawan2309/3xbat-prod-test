/*
  Warnings:

  - The values [MAIN,BONUS,LOCKED] on the enum `BalanceType` will be removed. If these variants are still used in the database, this will fail.
  - The values [LIVE,CLOSED,ABANDONED,CANCELED,OPEN,SUSPENDED,SETTLED,SCHEDULED,POSTPONED] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUPER_ADMIN,SUB_OWNER,SUB,MASTER,SUPER_AGENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUSPENDED,BANNED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `oddsData` on the `match_odds` table. All the data in the column will be lost.
  - You are about to drop the column `teams` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `creditLimit` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mobileshare` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `balances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exposures` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BalanceType_new" AS ENUM ('MAIN_BALANCE', 'BONUS_BALANCE', 'CASINO_BALANCE', 'LOCKED_BALANCE');
ALTER TABLE "user_balances" ALTER COLUMN "type" TYPE "BalanceType_new" USING ("type"::text::"BalanceType_new");
ALTER TYPE "BalanceType" RENAME TO "BalanceType_old";
ALTER TYPE "BalanceType_new" RENAME TO "BalanceType";
DROP TYPE "BalanceType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MatchStatus_new" AS ENUM ('INPLAY', 'UPCOMING', 'COMPLETED', 'REMOVED', 'FINISHED');
ALTER TABLE "matches" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "matches" ALTER COLUMN "status" TYPE "MatchStatus_new" USING ("status"::text::"MatchStatus_new");
ALTER TYPE "MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "MatchStatus_old";
ALTER TABLE "matches" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "balances" DROP CONSTRAINT "balances_userId_fkey";

-- DropForeignKey
ALTER TABLE "exposures" DROP CONSTRAINT "exposures_matchId_fkey";

-- DropForeignKey
ALTER TABLE "exposures" DROP CONSTRAINT "exposures_userId_fkey";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "match_odds" DROP COLUMN "oddsData";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "teams";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "creditLimit",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "mobileshare",
ADD COLUMN     "limit" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "balances";

-- DropTable
DROP TABLE "exposures";

-- CreateTable
CREATE TABLE "user_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BalanceType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "locked" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "available" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_balances_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "user_balances_userId_idx" ON "user_balances"("userId");

-- CreateIndex
CREATE INDEX "user_balances_type_idx" ON "user_balances"("type");

-- CreateIndex
CREATE UNIQUE INDEX "user_balances_userId_type_key" ON "user_balances"("userId", "type");

-- CreateIndex
CREATE INDEX "user_exposures_userId_idx" ON "user_exposures"("userId");

-- CreateIndex
CREATE INDEX "user_exposures_matchId_idx" ON "user_exposures"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "user_exposures_userId_matchId_key" ON "user_exposures"("userId", "matchId");

-- AddForeignKey
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exposures" ADD CONSTRAINT "user_exposures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exposures" ADD CONSTRAINT "user_exposures_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
