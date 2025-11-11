/*
  # Add full_name to signup_requests

  1. Changes
    - Add `full_name` column to `signup_requests` table
    - Add `full_name` column to `approved_emails` table
    
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if columns already exist
    - Sets default empty string for backwards compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'signup_requests' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE signup_requests ADD COLUMN full_name text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'approved_emails' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE approved_emails ADD COLUMN full_name text DEFAULT '';
  END IF;
END $$;