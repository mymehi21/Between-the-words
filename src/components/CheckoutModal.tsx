import { useState } from 'react';
import { X, CreditCard, FileText, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Book } from '../lib/supabase';

interface CheckoutModalProps {
  book: Book | null;
  orderType: 'pdf' | 'physical' | null;
  onClose: () => void;
  onCheckout: (customerInfo: CustomerInfo) => void;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function CheckoutModal({ book, orderType, onClose, onCheckout }: CheckoutModalProps) {
  const { language, t } = useLanguage();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  if (!book || !orderType) return null;

  const price = orderType === 'pdf' ? book.pdf_price : book.physical_price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout(customerInfo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className={`text-2xl font-bold text-gray-900 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('checkout.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8 p-4 bg-amber-50 rounded-xl">
            <h3 className={`text-lg font-semibold text-gray-900 mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {t('checkout.bookDetails')}
            </h3>
            <div className="flex gap-4">
              <div className="w-20 h-28 bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg flex-shrink-0 overflow-hidden">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {orderType === 'pdf' ? (
                      <FileText className="w-8 h-8 text-amber-700" />
                    ) : (
                      <Package className="w-8 h-8 text-amber-700" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-gray-900 mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {language === 'ar' ? book.title_ar : book.title_en}
                </h4>
                <p className={`text-sm text-gray-600 mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {language === 'ar' ? book.author_ar : book.author_en}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {orderType === 'pdf' ? (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{language === 'ar' ? 'نسخة إلكترونية' : 'Digital PDF'}</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>{language === 'ar' ? 'نسخة ورقية' : 'Physical Book'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-700">
                  ${price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                language === 'ar' ? 'font-arabic text-right' : ''
              }`}>
                {t('checkout.name')}
              </label>
              <input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  language === 'ar' ? 'text-right font-arabic' : ''
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                language === 'ar' ? 'font-arabic text-right' : ''
              }`}>
                {t('checkout.email')}
              </label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  language === 'ar' ? 'text-right font-arabic' : ''
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                language === 'ar' ? 'font-arabic text-right' : ''
              }`}>
                {t('checkout.phone')}
              </label>
              <input
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  language === 'ar' ? 'text-right font-arabic' : ''
                }`}
              />
            </div>

            {orderType === 'physical' && (
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                  language === 'ar' ? 'font-arabic text-right' : ''
                }`}>
                  {t('checkout.address')}
                </label>
                <textarea
                  required
                  rows={3}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    language === 'ar' ? 'text-right font-arabic' : ''
                  }`}
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className={`text-lg font-semibold text-gray-900 ${language === 'ar' ? 'font-arabic' : ''}`}>
                  {t('checkout.total')}
                </span>
                <span className="text-2xl font-bold text-amber-700">
                  ${price.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-800 hover:to-orange-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-5 h-5" />
                {t('checkout.pay')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
