/*
  # Create Signup Requests System
  
  1. New Tables
    - `signup_requests` - stores pending account creation requests
  
  2. Security
    - Enable RLS
    - Allow anonymous users to submit requests
    - Allow admins to view and manage requests
*/

-- Create signup_requests table
CREATE TABLE IF NOT EXISTS signup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT NOW(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE signup_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even anonymous) to submit signup requests
CREATE POLICY "Anyone can submit signup request"
  ON signup_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to view all requests
CREATE POLICY "Admins can view signup requests"
  ON signup_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );

-- Allow admins to update requests (approve/reject)
CREATE POLICY "Admins can update signup requests"
  ON signup_requests FOR UPDATE
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

-- Allow admins to delete requests
CREATE POLICY "Admins can delete signup requests"
  ON signup_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approved_emails
      WHERE approved_emails.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND approved_emails.is_active = true
    )
  );
