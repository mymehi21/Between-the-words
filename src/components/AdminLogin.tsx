import { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function AdminLogin() {
  const { language } = useLanguage();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'خطأ في العملية' : 'Error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-700 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold text-gray-900 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'لوحة الإدارة' : 'Admin Portal'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isSignUp
              ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create a new account')
              : (language === 'ar' ? 'قم بتسجيل الدخول' : 'Login to continue')
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                  language === 'ar' ? 'font-arabic text-right' : ''
                }`}>
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
                    language === 'ar' ? 'right-3' : 'left-3'
                  }`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      language === 'ar' ? 'pr-12 text-right font-arabic' : 'pl-12'
                    }`}
                    placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'your@email.com'}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${
                  language === 'ar' ? 'font-arabic text-right' : ''
                }`}>
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${
                    language === 'ar' ? 'right-3' : 'left-3'
                  }`} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      language === 'ar' ? 'pr-12 text-right font-arabic' : 'pl-12'
                    }`}
                    placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
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
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-lg font-semibold text-lg hover:from-amber-800 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSignUp
                      ? (language === 'ar' ? 'جاري التسجيل...' : 'Signing up...')
                      : (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...')
                    }
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {isSignUp
                      ? (language === 'ar' ? 'إنشاء حساب' : 'Sign Up')
                      : (language === 'ar' ? 'تسجيل الدخول' : 'Login')
                    }
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors"
              >
                {isSignUp
                  ? (language === 'ar' ? 'لديك حساب؟ تسجيل الدخول' : 'Already have an account? Login')
                  : (language === 'ar' ? 'ليس لديك حساب؟ إنشاء حساب' : "Don't have an account? Sign Up")
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
