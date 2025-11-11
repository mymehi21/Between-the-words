/*
  # Fix Reviews RLS - Remove All Duplicates and Create Clean Policies

  1. Changes
    - Drop ALL existing policies on reviews table
    - Create fresh, clean RLS policies
    - Allow anonymous users to insert reviews
    - Allow public to view featured reviews only
    - Allow admins to manage all reviews

  2. Security
    - Anonymous users can submit reviews (for public review form)
    - Only featured reviews are visible to public
    - Admins have full access to all reviews
*/

-- Drop all existing policies on reviews
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON reviews';
    END LOOP;
END $$;

-- Create clean policies
CREATE POLICY "anon_can_insert_reviews"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_can_insert_reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "public_can_view_featured_reviews"
  ON reviews FOR SELECT
  TO public
  USING (featured = true);

CREATE POLICY "admins_can_view_all_reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "admins_can_update_reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "admins_can_delete_reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );
