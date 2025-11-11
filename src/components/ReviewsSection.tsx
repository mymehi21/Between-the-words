import { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

export function ReviewsSection() {
  const { language, t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reviewText: '',
    rating: 5
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          reviewer_name: formData.name,
          review_text: formData.reviewText,
          rating: formData.rating,
          featured: true
        }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      alert(language === 'ar'
        ? 'شكراً لمراجعتك! تم نشرها بنجاح.'
        : 'Thank you for your review! It has been published successfully.');

      setFormData({ name: '', email: '', reviewText: '', rating: 5 });
      setShowForm(false);

      await loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(`${language === 'ar' ? 'خطأ في إرسال المراجعة' : 'Error submitting review'}: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
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
    return (
      <section className="py-20 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Loading reviews...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold text-gray-900 mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'آراء القراء' : 'Reader Reviews'}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-700 to-orange-600 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'اقرأ ما يقوله القراء عن أعمالي، وشاركنا رأيك!'
              : 'Read what readers are saying about my work, and share your thoughts!'}
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{review.reviewer_name}</h3>
                  {renderStars(review.rating)}
                </div>
                <p className={`text-gray-700 mb-4 ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
                  "{review.review_text}"
                </p>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mb-12">
            {language === 'ar' ? 'لا توجد مراجعات بعد. كن أول من يترك مراجعة!' : 'No reviews yet. Be the first to leave one!'}
          </div>
        )}

        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-full font-semibold hover:from-amber-800 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {language === 'ar' ? 'اترك مراجعة' : 'Leave a Review'}
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h3 className={`text-2xl font-bold text-gray-900 mb-6 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'اترك مراجعتك' : 'Leave Your Review'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${language === 'ar' ? 'text-right font-arabic' : ''}`}
                  placeholder={language === 'ar' ? 'اسمك' : 'Your name'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${language === 'ar' ? 'text-right font-arabic' : ''}`}
                  placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'your@email.com'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {language === 'ar' ? 'التقييم' : 'Rating'}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {language === 'ar' ? 'مراجعتك' : 'Your Review'}
                </label>
                <textarea
                  required
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  rows={5}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${language === 'ar' ? 'text-right font-arabic' : ''}`}
                  placeholder={language === 'ar' ? 'شاركنا رأيك...' : 'Share your thoughts...'}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-800 hover:to-orange-700 transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...')
                    : (language === 'ar' ? 'إرسال' : 'Submit')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
