import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase, Book } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';
import { notifySubscribers } from '../../lib/newsletter';

interface BooksManagementProps {
  language: string;
}

export function BooksManagement({ language }: BooksManagementProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const handleSave = async () => {
    if (!editingBook) return;
    setLoading(true);

    try {
      const isNewBook = !editingBook.id;

      if (editingBook.id) {
        const { error } = await supabase
          .from('books')
          .update(editingBook)
          .eq('id', editingBook.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('books')
          .insert([editingBook]);

        if (error) throw error;

        if (isNewBook) {
          try {
            await notifySubscribers(
              `New Book: ${editingBook.title_en}`,
              `A new book "${editingBook.title_en}" by ${editingBook.author_en} is now available! Get your copy today.`,
              'new_book'
            );
          } catch (notifyError) {
            console.error('Failed to notify subscribers:', notifyError);
          }
        }
      }

      await loadBooks();
      setEditingBook(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إدارة الكتب' : 'Books Management'}
          </h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingBook({
                title_en: '',
                title_ar: '',
                description_en: '',
                description_ar: '',
                author_en: '',
                author_ar: '',
                pdf_price: 0,
                physical_price: 0,
                is_available: true,
                featured: false
              });
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة كتاب' : 'Add Book'}
          </button>
        </div>

        {(editingBook || isAdding) && (
          <div className="mb-8 p-6 border-2 border-amber-500 rounded-lg bg-amber-50">
            <h3 className="text-xl font-semibold mb-4">
              {editingBook?.id ? 'Edit Book' : 'New Book'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (English)</label>
                <input
                  type="text"
                  value={editingBook?.title_en || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, title_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title (Arabic)</label>
                <input
                  type="text"
                  value={editingBook?.title_ar || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (English)</label>
                <textarea
                  value={editingBook?.description_en || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, description_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={4}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Arabic)</label>
                <textarea
                  value={editingBook?.description_ar || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, description_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author (English)</label>
                <input
                  type="text"
                  value={editingBook?.author_en || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, author_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Author (Arabic)</label>
                <input
                  type="text"
                  value={editingBook?.author_ar || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, author_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PDF Price ($)</label>
                <input
                  type="number"
                  value={editingBook?.pdf_price || 0}
                  onChange={(e) => setEditingBook({ ...editingBook, pdf_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Price ($)</label>
                <input
                  type="number"
                  value={editingBook?.physical_price || 0}
                  onChange={(e) => setEditingBook({ ...editingBook, physical_price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                <ImageUpload
                  category="book_cover"
                  onUploadComplete={(url) => setEditingBook({ ...editingBook, cover_image_url: url })}
                />
                {editingBook?.cover_image_url && (
                  <img src={editingBook.cover_image_url} alt="Cover" className="mt-2 max-h-32 rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
                <input
                  type="text"
                  value={editingBook?.isbn || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pages</label>
                <input
                  type="number"
                  value={editingBook?.pages || 0}
                  onChange={(e) => setEditingBook({ ...editingBook, pages: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">PDF URL</label>
                <input
                  type="url"
                  value={editingBook?.pdf_url || ''}
                  onChange={(e) => setEditingBook({ ...editingBook, pdf_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingBook?.is_available || false}
                    onChange={(e) => setEditingBook({ ...editingBook, is_available: e.target.checked })}
                    className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Available for Purchase</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingBook?.featured || false}
                    onChange={(e) => setEditingBook({ ...editingBook, featured: e.target.checked })}
                    className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Featured Book</span>
                </label>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingBook(null);
                    setIsAdding(false);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {book.cover_image_url && (
                <img src={book.cover_image_url} alt={book.title_en} className="w-full h-64 object-cover" />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title_en}</h3>
                <p className="text-sm text-gray-600 mb-2">{book.author_en}</p>
                <div className="flex gap-2 mb-3">
                  {book.featured && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">Featured</span>
                  )}
                  {!book.is_available && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Unavailable</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <div>PDF: ${book.pdf_price}</div>
                  <div>Physical: ${book.physical_price}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBook(book)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              {language === 'ar' ? 'لا توجد كتب بعد' : 'No books yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
