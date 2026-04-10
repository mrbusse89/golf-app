-- Add driving distance column to rounds table
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS avg_driving_distance INTEGER;

-- Index for driving distance stats queries
CREATE INDEX IF NOT EXISTS idx_rounds_avg_driving_distance ON rounds(user_id, avg_driving_distance) WHERE avg_driving_distance IS NOT NULL;
