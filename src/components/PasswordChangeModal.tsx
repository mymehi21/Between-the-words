import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface PasswordChangeModalProps {
  onPasswordChanged: () => void;
}

export function PasswordChangeModal({ onPasswordChanged }: PasswordChangeModalProps) {
  const { language } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: dbError } = await supabase
          .from('admin_users')
          .update({ needs_password_change: false })
          .eq('user_id', user.id);

        if (dbError) throw dbError;
      }

      onPasswordChanged();
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'خطأ في تحديث كلمة المرور' : 'Error updating password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>
          <h2 className={`text-2xl font-bold text-gray-900 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          </h2>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 text-left">
              {language === 'ar'
                ? 'يجب عليك تغيير كلمة المرور الافتراضية قبل المتابعة'
                : 'You must change the default password before continuing'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${
              language === 'ar' ? 'font-arabic text-right' : ''
            }`}>
              {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
                language === 'ar' ? 'right-3' : 'left-3'
              }`} />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  language === 'ar' ? 'pr-12 text-right font-arabic' : 'pl-12'
                }`}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'ar' ? 'على الأقل 6 أحرف' : 'Minimum 6 characters'}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-2 ${
              language === 'ar' ? 'font-arabic text-right' : ''
            }`}>
              {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
                language === 'ar' ? 'right-3' : 'left-3'
              }`} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  language === 'ar' ? 'pr-12 text-right font-arabic' : 'pl-12'
                }`}
                placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-800 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50"
          >
            {loading
              ? (language === 'ar' ? 'جاري التحديث...' : 'Updating...')
              : (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
          </button>
        </form>
      </div>
    </div>
  );
}
