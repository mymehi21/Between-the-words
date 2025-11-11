/*
  # Author Website Database Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title_en` (text) - English title
      - `title_ar` (text) - Arabic title
      - `description_en` (text) - English description
      - `description_ar` (text) - Arabic description
      - `author_en` (text) - Author name in English
      - `author_ar` (text) - Author name in Arabic
      - `cover_image_url` (text) - Book cover image URL
      - `pdf_price` (decimal) - Price for PDF version
      - `physical_price` (decimal) - Price for physical book
      - `pdf_url` (text) - URL to PDF file (stored securely)
      - `isbn` (text) - ISBN number
      - `pages` (integer) - Number of pages
      - `published_date` (date) - Publication date
      - `is_available` (boolean) - Whether book is available for purchase
      - `featured` (boolean) - Featured book on homepage
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique) - Human-readable order number
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `customer_address` (text) - For physical book delivery
      - `book_id` (uuid, foreign key to books)
      - `order_type` (text) - 'pdf' or 'physical'
      - `amount` (decimal) - Total amount paid
      - `stripe_payment_intent_id` (text) - Stripe payment ID
      - `status` (text) - 'pending', 'completed', 'shipped', 'cancelled'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `subscribed_at` (timestamptz)
      - `is_active` (boolean)

    - `site_content`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Content identifier (e.g., 'hero_title_en')
      - `value` (text) - Content value
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Books: Public read access, authenticated admin write access
    - Orders: Customers can create, admins can view all
    - Newsletter: Public can insert, admins can view
    - Site content: Public read, admin write
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  author_en text NOT NULL DEFAULT '',
  author_ar text NOT NULL DEFAULT '',
  cover_image_url text DEFAULT '',
  pdf_price decimal(10, 2) NOT NULL DEFAULT 0,
  physical_price decimal(10, 2) NOT NULL DEFAULT 0,
  pdf_url text DEFAULT '',
  isbn text DEFAULT '',
  pages integer DEFAULT 0,
  published_date date,
  is_available boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text DEFAULT '',
  customer_address text DEFAULT '',
  book_id uuid REFERENCES books(id) ON DELETE RESTRICT,
  order_type text NOT NULL CHECK (order_type IN ('pdf', 'physical')),
  amount decimal(10, 2) NOT NULL,
  stripe_payment_intent_id text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'shipped', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text DEFAULT '',
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create site content table
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_books_available ON books(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Books policies: Public can read, authenticated admins can manage
CREATE POLICY "Anyone can view available books"
  ON books FOR SELECT
  USING (is_available = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);

-- Orders policies: Anyone can create orders, admins can view all
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Newsletter policies: Anyone can subscribe, admins can view
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site content policies: Public read, admin write
CREATE POLICY "Anyone can view site content"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage site content"
  ON site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();