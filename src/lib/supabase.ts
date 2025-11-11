import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Book {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  author_en: string;
  author_ar: string;
  cover_image_url: string;
  pdf_price: number;
  physical_price: number;
  pdf_url: string;
  isbn: string;
  pages: number;
  published_date: string;
  is_available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  book_id: string;
  order_type: 'pdf' | 'physical';
  amount: number;
  stripe_payment_intent_id: string;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  subscribed_at: string;
  is_active: boolean;
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  approved_by: string;
  approved_at: string;
  is_active: boolean;
  created_at: string;
}

export interface ApprovedEmail {
  id: string;
  email: string;
  approved_by: string;
  approved_at: string;
  is_active: boolean;
  created_at: string;
}

export interface ImageRecord {
  id: string;
  filename: string;
  storage_path: string;
  public_url: string;
  alt_text_en: string;
  alt_text_ar: string;
  category: string;
  uploaded_by: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  excerpt_en: string;
  excerpt_ar: string;
  content_en: string;
  content_ar: string;
  featured_image: string;
  category: string;
  published: boolean;
  published_at: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  event_date: string;
  location_en: string;
  location_ar: string;
  event_type: string;
  rsvp_link: string;
  image_url: string;
  is_past: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_name: string;
  review_text_en: string;
  review_text_ar: string;
  source: string;
  source_url: string;
  rating: number;
  featured: boolean;
  book_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export async function checkIsApprovedAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_approved_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
