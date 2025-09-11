-- Migration to update the existing Bet model for new betting categories
-- This migration adds the new fields and updates the existing scope field

-- Add marketName column if it doesn't exist
ALTER TABLE bets ADD COLUMN IF NOT EXISTS market_name VARCHAR;

-- Rename scope column to bet_category for clarity
ALTER TABLE bets RENAME COLUMN scope TO bet_category;

-- Add index on bet_category for better query performance
CREATE INDEX IF NOT EXISTS idx_bets_bet_category ON bets(bet_category);

-- Update existing records to have proper bet_category values
-- Assuming existing records are match bets by default
UPDATE bets SET bet_category = 'MATCH' WHERE bet_category IS NULL;

-- Add comment to the table for documentation
COMMENT ON TABLE bets IS 'Unified betting table supporting both match and session bets';
COMMENT ON COLUMN bets.bet_category IS 'Betting category: MATCH or SESSION';
COMMENT ON COLUMN bets.market_name IS 'Market name for better categorization and display';
