/*
  # Drop all duplicate and old policies

  Drop all existing policies so we can recreate them cleanly
*/

-- Drop all reviews policies
DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view featured reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Approved admins can manage reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;

-- Drop all books policies
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;

-- Drop all signup_requests policies
DROP POLICY IF EXISTS "Admins can view signup requests" ON signup_requests;
DROP POLICY IF EXISTS "Admins can update signup requests" ON signup_requests;
DROP POLICY IF EXISTS "Admins can delete signup requests" ON signup_requests;

-- Drop storage policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
