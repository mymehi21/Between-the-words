import { BooksSection } from '../components/BooksSection';
import { Book } from '../lib/supabase';

interface BooksPageProps {
  onBookSelect: (book: Book, type: 'pdf' | 'physical') => void;
}

export function BooksPage({ onBookSelect }: BooksPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Literary background with book imagery */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          filter: 'brightness(0.4)'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-amber-950/90 to-slate-900/95"></div>

      {/* Decorative floating elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-20 w-64 h-80 bg-amber-300 rounded-lg rotate-12 blur-2xl"></div>
        <div className="absolute bottom-40 right-32 w-56 h-72 bg-orange-400 rounded-lg -rotate-12 blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <BooksSection onBookSelect={onBookSelect} />
      </div>
    </div>
  );
}
