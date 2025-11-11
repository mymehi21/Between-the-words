/*
  # Fix Auto-Add Admin Trigger
  
  1. Changes
    - Make auto_add_approved_admin function run with SECURITY DEFINER
    - This allows the trigger to bypass RLS policies when adding new admins
    - Ensures approved emails can automatically become admins on signup
  
  2. Security
    - Function only adds users whose email is in approved_emails table
    - No risk of privilege escalation
*/

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS auto_add_approved_admin CASCADE;

CREATE OR REPLACE FUNCTION auto_add_approved_admin()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the user's email is in approved_emails
  IF EXISTS (
    SELECT 1 FROM approved_emails
    WHERE email = NEW.email
    AND is_active = true
  ) THEN
    -- Add to admin_users
    INSERT INTO admin_users (user_id, email, is_active, approved_by)
    VALUES (NEW.id, NEW.email, true, 'system')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_add_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_add_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_approved_admin();
