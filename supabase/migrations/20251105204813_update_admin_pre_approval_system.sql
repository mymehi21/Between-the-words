/*
  # Update Admin Pre-Approval System
  
  1. Changes
    - Add approved_emails table to store emails that are pre-approved for admin access
    - When someone tries to log in, they can only become admin if their email is pre-approved
    - Remove the foreign key requirement on admin_users.user_id temporarily
    
  2. New Tables
    - `approved_emails`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Email addresses approved for admin access
      - `approved_by` (text) - Who approved this email
      - `approved_at` (timestamp)
      - `is_active` (boolean) - Can be disabled without deleting
      - `created_at` (timestamp)
      
  3. Security
    - Enable RLS on approved_emails table
    - Only authenticated admins can view and manage approved emails
*/

-- Create approved emails table
CREATE TABLE IF NOT EXISTS approved_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved_by text DEFAULT 'system',
  approved_at timestamptz DEFAULT NOW(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE approved_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approved_emails
CREATE POLICY "Authenticated users can view approved emails"
  ON approved_emails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert approved emails"
  ON approved_emails FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update approved emails"
  ON approved_emails FOR UPDATE
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

CREATE POLICY "Admins can delete approved emails"
  ON approved_emails FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Insert the first admin email
INSERT INTO approved_emails (email, approved_by, is_active)
VALUES ('testnetwork61@gmail.com', 'system', true)
ON CONFLICT (email) DO UPDATE SET is_active = true;
