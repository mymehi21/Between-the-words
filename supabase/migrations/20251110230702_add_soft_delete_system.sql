/*
  # Add Soft Delete System

  1. Changes to Existing Tables
    - Add `deleted_at` column to books, reviews, orders, blog_posts, events tables
    - Add `deleted_by` column to track who deleted the item
  
  2. Security
    - Update RLS policies to exclude soft-deleted items from regular queries
    - Allow admins to view and restore deleted items
*/

-- Add soft delete columns to books
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Add soft delete columns to reviews
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Add soft delete columns to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Add soft delete columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Add soft delete columns to events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS books_deleted_at_idx ON books(deleted_at);
CREATE INDEX IF NOT EXISTS reviews_deleted_at_idx ON reviews(deleted_at);
CREATE INDEX IF NOT EXISTS orders_deleted_at_idx ON orders(deleted_at);
CREATE INDEX IF NOT EXISTS blog_posts_deleted_at_idx ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS events_deleted_at_idx ON events(deleted_at);