import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Star } from 'lucide-react';
import { supabase, Review, Book } from '../../lib/supabase';

interface ReviewsManagementProps {
  language: string;
}

export function ReviewsManagement({ language }: ReviewsManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadReviews();
    loadBooks();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title_en');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const handleSave = async () => {
    if (!editingReview) return;

    try {
      const reviewData = {
        ...editingReview,
        updated_at: new Date().toISOString()
      };

      if (editingReview.id) {
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', editingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert([reviewData]);

        if (error) throw error;
      }

      await loadReviews();
      setEditingReview(null);
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Error saving review');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      await loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'ar' ? 'إدارة المراجعات' : 'Reviews Management'}
          </h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingReview({
                reviewer_name: '',
                review_text_en: '',
                review_text_ar: '',
                source: 'reader',
                rating: 5,
                featured: false
              });
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة مراجعة' : 'Add Review'}
          </button>
        </div>

        {(editingReview || isAdding) && (
          <div className="mb-8 p-6 border-2 border-amber-500 rounded-lg bg-amber-50">
            <h3 className="text-xl font-semibold mb-4">
              {editingReview?.id ? 'Edit Review' : 'New Review'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reviewer Name</label>
                <input
                  type="text"
                  value={editingReview?.reviewer_name || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, reviewer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                <input
                  type="text"
                  value={editingReview?.source || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., New York Times, reader, blog"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Review Text (English)</label>
                <textarea
                  value={editingReview?.review_text_en || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, review_text_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={4}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Review Text (Arabic)</label>
                <textarea
                  value={editingReview?.review_text_ar || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, review_text_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editingReview?.rating || 5}
                  onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Book (Optional)</label>
                <select
                  value={editingReview?.book_id || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, book_id: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">None</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>{book.title_en}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source URL (Optional)</label>
                <input
                  type="url"
                  value={editingReview?.source_url || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, source_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="https://"
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingReview?.featured || false}
                    onChange={(e) => setEditingReview({ ...editingReview, featured: e.target.checked })}
                    className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Feature on Homepage</span>
                </label>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingReview(null);
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

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{review.reviewer_name}</h3>
                    <span className="text-sm text-gray-500">({review.source})</span>
                    {review.featured && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">Featured</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{review.review_text_en}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleFeatured(review.id, review.featured)}
                    className={`px-3 py-1 rounded-lg transition-colors ${review.featured ? 'bg-amber-100 hover:bg-amber-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {review.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    onClick={() => setEditingReview(review)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {language === 'ar' ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
