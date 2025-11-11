import { useState, useEffect } from 'react';
import { Star, Eye, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

interface NewReviewsManagementProps {
  language: string;
}

export function NewReviewsManagement({ language }: NewReviewsManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (reviewId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ featured: !currentFeatured })
        .eq('id', reviewId);

      if (error) throw error;
      await loadReviews();
      alert(`Review ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('reviews')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq('id', reviewId);

      if (error) throw error;
      await loadReviews();
      alert('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reviews Management</h2>
        <div className="flex gap-4 text-sm">
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
            Featured: {reviews.filter(r => r.featured).length}
          </span>
          <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold">
            Total: {reviews.length}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <div key={review.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-shadow ${
            review.featured ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
          }`}>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{review.reviewer_name}</h3>
                    {review.featured && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <div>
                <p className="text-gray-700 italic">"{review.review_text}"</p>
              </div>

              <div className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleString()}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => setSelectedReview(review)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => toggleFeatured(review.id, review.featured)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    review.featured
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {review.featured ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {review.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xl text-gray-900">{selectedReview.reviewer_name}</h4>
                </div>
                {renderStars(selectedReview.rating)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Review:</p>
                <p className="text-gray-900 text-lg">"{selectedReview.review_text}"</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Submitted on: {new Date(selectedReview.created_at).toLocaleString()}</span>
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  selectedReview.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedReview.featured ? 'Featured' : 'Not Featured'}
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    toggleFeatured(selectedReview.id, selectedReview.featured);
                    setSelectedReview(null);
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold ${
                    selectedReview.featured
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedReview.featured ? 'Unfeature Review' : 'Feature Review'}
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No reviews yet</p>
        </div>
      )}
    </div>
  );
}
