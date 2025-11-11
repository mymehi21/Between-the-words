import { CheckCircle, Download, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OrderSuccessProps {
  orderNumber: string;
  pdfUrl?: string;
  onClose: () => void;
}

export function OrderSuccess({ orderNumber, pdfUrl, onClose }: OrderSuccessProps) {
  const { language, t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h2 className={`text-2xl font-bold text-gray-900 mb-3 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('order.success')}
        </h2>

        <p className={`text-gray-600 mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('order.number')}: <span className="font-mono font-semibold">{orderNumber}</span>
        </p>

        <p className={`text-sm text-gray-500 mb-6 ${language === 'ar' ? 'font-arabic' : ''}`}>
          {t('order.email')}
        </p>

        <div className="space-y-3">
          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-800 hover:to-orange-700 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              {t('order.download')}
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Mail className="w-4 h-4" />
            <span className={language === 'ar' ? 'font-arabic' : ''}>
              {language === 'ar'
                ? 'تحقق من بريدك الإلكتروني للحصول على التفاصيل'
                : 'Check your email for details'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
