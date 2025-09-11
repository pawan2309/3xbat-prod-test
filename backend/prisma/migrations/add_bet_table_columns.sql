-- Migration: Add additional columns to bets table for table display
-- Date: 2025-09-11

-- Add new columns for table display
ALTER TABLE bets ADD COLUMN team_name VARCHAR(255);
ALTER TABLE bets ADD COLUMN bet_mode VARCHAR(50);
ALTER TABLE bets ADD COLUMN session_description VARCHAR(255);
ALTER TABLE bets ADD COLUMN target_value VARCHAR(100);
ALTER TABLE bets ADD COLUMN casino_game VARCHAR(100);
ALTER TABLE bets ADD COLUMN bet_description VARCHAR(255);
ALTER TABLE bets ADD COLUMN round_id VARCHAR(100);
ALTER TABLE bets ADD COLUMN transaction_id VARCHAR(100);

-- Make match_id and market_id optional (nullable)
ALTER TABLE bets ALTER COLUMN match_id DROP NOT NULL;
ALTER TABLE bets ALTER COLUMN market_id DROP NOT NULL;

-- Add indexes for better query performance
CREATE INDEX idx_bets_team_name ON bets(team_name);
CREATE INDEX idx_bets_casino_game ON bets(casino_game);
CREATE INDEX idx_bets_round_id ON bets(round_id);
CREATE INDEX idx_bets_transaction_id ON bets(transaction_id);
