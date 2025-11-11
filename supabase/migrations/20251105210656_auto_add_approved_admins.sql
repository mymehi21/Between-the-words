/*
  # Automatically Add Approved Admins
  
  1. Changes
    - Create a trigger that automatically adds users to admin_users when they sign up
    - Only adds them if their email is in the approved_emails table
    
  2. Function
    - Runs after a new user is created in auth.users
    - Checks if their email is approved
    - Automatically adds them to admin_users
*/

-- Create function to auto-add approved admins
CREATE OR REPLACE FUNCTION auto_add_approved_admin()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_add_admin ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created_add_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_approved_admin();

-- Manually add any existing approved users
-- First, let's check current auth users with approved emails
DO $$
DECLARE
  approved_email_record RECORD;
  auth_user_record RECORD;
BEGIN
  FOR approved_email_record IN 
    SELECT * FROM approved_emails WHERE is_active = true
  LOOP
    -- Find matching auth user
    SELECT * INTO auth_user_record 
    FROM auth.users 
    WHERE email = approved_email_record.email
    LIMIT 1;
    
    -- If user exists in auth.users, add to admin_users
    IF FOUND THEN
      INSERT INTO admin_users (user_id, email, is_active, approved_by)
      VALUES (auth_user_record.id, auth_user_record.email, true, 'system')
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;
