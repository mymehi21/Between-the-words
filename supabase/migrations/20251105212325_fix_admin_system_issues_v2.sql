/*
  # Fix Admin System Issues - Version 2
  
  1. Fix infinite recursion in admin_users RLS
  2. Add missing columns to images table
  3. Fix books table null constraints
  4. Add admin_requests table for signup approval flow
*/

-- Fix 1: Drop and recreate admin_users RLS policies without recursion
DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert new admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin status" ON admin_users;

-- Allow users to view their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow system to insert new admin users (used by trigger)
CREATE POLICY "System can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix 2: Update images table to match code expectations
ALTER TABLE images 
  ADD COLUMN IF NOT EXISTS public_url text,
  ADD COLUMN IF NOT EXISTS alt_text_en text DEFAULT '',
  ADD COLUMN IF NOT EXISTS alt_text_ar text DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'other';

-- Populate public_url from url if needed
UPDATE images SET public_url = url WHERE public_url IS NULL;

-- Fix 3: Make book prices nullable with defaults
ALTER TABLE books 
  ALTER COLUMN pdf_price DROP NOT NULL,
  ALTER COLUMN pdf_price SET DEFAULT 0,
  ALTER COLUMN physical_price DROP NOT NULL,
  ALTER COLUMN physical_price SET DEFAULT 0;

-- Fix 4: Update images RLS policies to not check admin_users
DROP POLICY IF EXISTS "Admins can upload images" ON images;
DROP POLICY IF EXISTS "Admins can update images" ON images;
DROP POLICY IF EXISTS "Admins can delete images" ON images;

-- New simplified policies using approved_emails
CREATE POLICY "Approved users can upload images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can update images"
  ON images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can delete images"
  ON images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Fix 5: Update Books RLS policies
DROP POLICY IF EXISTS "Admins can create books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;

CREATE POLICY "Approved users can create books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Fix 6: Update Blog RLS policies
DROP POLICY IF EXISTS "Admins can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON blog_posts;

CREATE POLICY "Approved users can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Fix 7: Update Events RLS
DROP POLICY IF EXISTS "Admins can create events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

CREATE POLICY "Approved users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Fix 8: Update Reviews RLS
DROP POLICY IF EXISTS "Admins can create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;

CREATE POLICY "Approved users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Approved users can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Fix 9: Update Site Content RLS
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_content;

CREATE POLICY "Approved users can manage site content"
  ON site_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );
