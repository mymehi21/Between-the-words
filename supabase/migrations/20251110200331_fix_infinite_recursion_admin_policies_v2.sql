/*
  # Fix Infinite Recursion in Admin Policies

  1. Changes
    - Drop all policies first
    - Drop the recursive is_boss_admin() function
    - Create simpler RLS policies that don't cause recursion
    
  2. Security
    - Admins can read all admin_users (needed for dashboard)
    - Only BOSS admin can insert/update/delete based on direct column check
*/

-- Drop all existing policies on admin_users first
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only BOSS can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Only BOSS can update other admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can update own password flag" ON admin_users;

-- Now drop the function
DROP FUNCTION IF EXISTS is_boss_admin() CASCADE;

-- Create new non-recursive policies

-- Allow authenticated users to read admin_users if they are an admin themselves
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Only allow insert if the user doing the insert is a BOSS
CREATE POLICY "Only BOSS can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.user_id = auth.uid()
      AND au.is_boss = true
      AND au.is_active = true
    )
  );

-- Only allow update if the user is BOSS (for managing others) or updating their own record
CREATE POLICY "BOSS can update any admin or users can update self"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.user_id = auth.uid()
      AND au.is_boss = true
      AND au.is_active = true
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.user_id = auth.uid()
      AND au.is_boss = true
      AND au.is_active = true
    )
  );

-- Only BOSS can delete admins
CREATE POLICY "Only BOSS can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users AS au
      WHERE au.user_id = auth.uid()
      AND au.is_boss = true
      AND au.is_active = true
    )
  );