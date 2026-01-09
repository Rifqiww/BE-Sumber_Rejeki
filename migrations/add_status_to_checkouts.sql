-- Migration: Add status column to checkouts table
-- Created: 2025-12-29
-- Description: Adds status tracking to checkout orders with default value "Belum dibayar"

-- Add the status column
ALTER TABLE checkouts 
ADD COLUMN status VARCHAR(155) NOT NULL DEFAULT 'Belum dibayar'
AFTER created_at;

-- Optional: Add index for faster status filtering
CREATE INDEX idx_checkouts_status ON checkouts(status);

-- Verify the changes
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'checkouts'
  AND COLUMN_NAME = 'status';
