import { useState, useEffect } from 'react';
import { BookOpen, FileText, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Book } from '../lib/supabase';

interface BooksSectionProps {
  onBookSelect: (book: Book, type: 'pdf' | 'physical') => void;
}

export function BooksSection({ onBookSelect }: BooksSectionProps) {
  const { language, t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-amber-300">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold text-amber-100 mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('books.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-700 to-orange-600 rounded-full mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map(book => (
            <div
              key={book.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={language === 'ar' ? book.title_ar : book.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-amber-700 opacity-50" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className={`text-2xl font-bold text-gray-900 mb-2 line-clamp-2 ${
                  language === 'ar' ? 'font-arabic' : ''
                }`}>
                  {language === 'ar' ? book.title_ar : book.title_en}
                </h3>

                <p className={`text-sm text-gray-600 mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {language === 'ar' ? book.author_ar : book.author_en}
                </p>

                <p className={`text-gray-700 mb-6 line-clamp-3 leading-relaxed ${
                  language === 'ar' ? 'font-arabic' : ''
                }`}>
                  {language === 'ar' ? book.description_ar : book.description_en}
                </p>

                {book.pages > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <FileText className="w-4 h-4" />
                    <span>{book.pages} {t('books.pages')}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {book.pdf_price > 0 && (
                    <button
                      onClick={() => onBookSelect(book, 'pdf')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold transition-colors group"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('books.buyPdf')}
                      </span>
                      <span>${book.pdf_price.toFixed(2)}</span>
                    </button>
                  )}

                  {book.physical_price > 0 && (
                    <button
                      onClick={() => onBookSelect(book, 'physical')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {t('books.buyPhysical')}
                      </span>
                      <span>${book.physical_price.toFixed(2)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center text-amber-300 py-12">
            {language === 'ar' ? 'لا توجد كتب متاحة حالياً' : 'No books available at the moment'}
          </div>
        )}
      </div>
    </section>
  );
}
