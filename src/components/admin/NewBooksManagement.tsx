import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, DollarSign, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ImageUpload } from '../ImageUpload';

interface Book {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  author_en: string;
  author_ar: string;
  pdf_price: number;
  physical_price: number;
  cover_image_url: string;
  pdf_url: string;
  is_available: boolean;
}

interface NewBooksManagementProps {
  language: string;
}

export function NewBooksManagement({ language }: NewBooksManagementProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    author_en: '',
    author_ar: '',
    pdf_price: 0,
    physical_price: 0,
    cover_image_url: '',
    pdf_url: '',
    is_available: true,
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      if (editingBook) {
        const { error } = await supabase
          .from('books')
          .update(formData)
          .eq('id', editingBook.id);

        if (error) throw error;
        alert('Book updated successfully!');
      } else {
        const { error } = await supabase
          .from('books')
          .insert([formData]);

        if (error) throw error;
        alert('Book added successfully!');
      }

      resetForm();
      await loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Error saving book');
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('books')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq('id', bookId);

      if (error) throw error;
      alert('Book deleted successfully!');
      await loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      author_en: '',
      author_ar: '',
      pdf_price: 0,
      physical_price: 0,
      cover_image_url: '',
      pdf_url: '',
      is_available: true,
    });
    setEditingBook(null);
    setShowForm(false);
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title_en: book.title_en,
      title_ar: book.title_ar,
      description_en: book.description_en,
      description_ar: book.description_ar,
      author_en: book.author_en,
      author_ar: book.author_ar,
      pdf_price: book.pdf_price,
      physical_price: book.physical_price,
      cover_image_url: book.cover_image_url,
      pdf_url: book.pdf_url,
      is_available: book.is_available,
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading books...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Books Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Book
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-4 rounded-t-2xl flex-shrink-0">
              <h3 className="text-xl font-bold text-white">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Arabic) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author_en}
                    onChange={(e) => setFormData({ ...formData, author_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author (Arabic) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author_ar}
                    onChange={(e) => setFormData({ ...formData, author_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pdf_price}
                    onChange={(e) => setFormData({ ...formData, pdf_price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Physical Book Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.physical_price}
                    onChange={(e) => setFormData({ ...formData, physical_price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English) *
                </label>
                <textarea
                  required
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Arabic) *
                </label>
                <textarea
                  required
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <ImageUpload
                  currentImageUrl={formData.cover_image_url}
                  onImageUploaded={(url) => setFormData({ ...formData, cover_image_url: url })}
                  bucketName="images"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File URL
                </label>
                <input
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="https://example.com/book.pdf"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Available for Purchase
                </label>
              </div>
            </form>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                >
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] bg-gray-100 relative">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
                book.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {book.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title_en}</h3>
                <p className="text-sm text-gray-500">{book.author_en}</p>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{book.description_en}</p>

              <div className="flex gap-2 text-sm">
                <span className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg font-medium text-center">
                  PDF: ${book.pdf_price}
                </span>
                <span className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg font-medium text-center">
                  Book: ${book.physical_price}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => startEdit(book)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No books yet. Add your first book!</p>
        </div>
      )}
    </div>
  );
}
