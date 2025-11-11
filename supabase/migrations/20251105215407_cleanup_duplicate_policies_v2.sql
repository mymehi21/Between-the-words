/*
  # Clean up duplicate RLS policies - Version 2
  
  Remove all duplicate policies and keep only clean, simple ones
*/

-- Clean up books policies
DROP POLICY IF EXISTS "Anyone can view available books" ON books;
DROP POLICY IF EXISTS "Approved admins can delete books" ON books;
DROP POLICY IF EXISTS "Approved admins can insert books" ON books;
DROP POLICY IF EXISTS "Approved admins can update books" ON books;
DROP POLICY IF EXISTS "Approved users can create books" ON books;
DROP POLICY IF EXISTS "Approved users can delete books" ON books;
DROP POLICY IF EXISTS "Approved users can update books" ON books;
DROP POLICY IF EXISTS "Public can view books" ON books;
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;

-- Create clean books policies
CREATE POLICY "Public can view books"
  ON books FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Admins can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Clean up images policies
DROP POLICY IF EXISTS "Anyone can view images" ON images;
DROP POLICY IF EXISTS "Admins can upload images" ON images;
DROP POLICY IF EXISTS "Admins can update images" ON images;
DROP POLICY IF EXISTS "Admins can delete images" ON images;
DROP POLICY IF EXISTS "Approved users can upload images" ON images;
DROP POLICY IF EXISTS "Approved users can update images" ON images;
DROP POLICY IF EXISTS "Approved users can delete images" ON images;
DROP POLICY IF EXISTS "Public can view images" ON images;

CREATE POLICY "Public can view images"
  ON images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can upload images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can update images"
  ON images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can delete images"
  ON images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Clean up blog_posts policies
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can view all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Approved users can view all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Approved users can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Approved users can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Approved users can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;

CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Admins can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Clean up events policies
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can create events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;
DROP POLICY IF EXISTS "Approved users can create events" ON events;
DROP POLICY IF EXISTS "Approved users can update events" ON events;
DROP POLICY IF EXISTS "Approved users can delete events" ON events;
DROP POLICY IF EXISTS "Public can view events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;

CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Clean up reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Approved users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Approved users can update reviews" ON reviews;
DROP POLICY IF EXISTS "Approved users can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;

CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );
