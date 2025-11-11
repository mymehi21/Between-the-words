/*
  # Fix is_approved_admin function to use approved_emails
  
  Replace the function to check approved_emails instead of admin_users
  to prevent infinite recursion
*/

-- Replace the function
CREATE OR REPLACE FUNCTION is_approved_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM approved_emails
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  );
END;
$$;
