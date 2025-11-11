/*
  # Fix Infinite Recursion with Security Definer Function

  1. Changes
    - Create a SECURITY DEFINER function that bypasses RLS
    - Simplify policies to avoid self-referencing queries
    - Use direct auth.uid() checks where possible
    
  2. Security
    - SECURITY DEFINER runs with elevated privileges to check admin status
    - Only returns boolean, cannot be exploited
    - Simple policies use direct checks without recursion
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Only BOSS can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "System can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "BOSS can update any admin or users can update self" ON admin_users;
DROP POLICY IF EXISTS "Only BOSS can delete admin users" ON admin_users;

-- Create a security definer function that checks if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function that checks if user is BOSS (bypasses RLS)
CREATE OR REPLACE FUNCTION check_is_boss()
RETURNS boolean AS $$
DECLARE
  is_boss_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_boss = true
    AND is_active = true
  ) INTO is_boss_user;
  
  RETURN is_boss_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simple policies using the security definer functions

-- Allow admins to view all admin users
CREATE POLICY "Admins can view all users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (check_is_admin());

-- Only BOSS can insert new admins
CREATE POLICY "BOSS can insert admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (check_is_boss());

-- BOSS can update anyone, regular admins can update only themselves
CREATE POLICY "BOSS updates all, users update self"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR check_is_boss())
  WITH CHECK (user_id = auth.uid() OR check_is_boss());

-- Only BOSS can delete admins
CREATE POLICY "BOSS can delete admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (check_is_boss());