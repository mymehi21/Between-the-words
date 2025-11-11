/*
  # Redesign BOSS Admin System

  1. Changes
    - Add `is_boss` column to `admin_users` table to identify the BOSS admin
    - Add `needs_password_change` column to track if user needs to set their password
    - Add `created_by` column to track who created the admin
    - Mark testnetwork61@gmail.com as BOSS admin
    - Drop signup_requests table (no longer needed)
    
  2. Security
    - Only BOSS admin (testnetwork61@gmail.com) can add new admins
    - Regular admins cannot add other admins
    - All new admins must change password on first login
*/

-- Add new columns to admin_users if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_boss'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_boss boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'needs_password_change'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN needs_password_change boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Mark BOSS admin
UPDATE admin_users 
SET is_boss = true 
WHERE email = 'testnetwork61@gmail.com';

-- Drop signup_requests table
DROP TABLE IF EXISTS signup_requests CASCADE;

-- Create function to check if user is BOSS admin
CREATE OR REPLACE FUNCTION is_boss_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_boss = true
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for admin_users table
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only BOSS can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Only BOSS can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update own profile" ON admin_users;

CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Only BOSS can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_boss_admin());

CREATE POLICY "Only BOSS can update other admins"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (is_boss_admin())
  WITH CHECK (is_boss_admin());

CREATE POLICY "Admins can update own password flag"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND NOT is_boss)
  WITH CHECK (user_id = auth.uid());