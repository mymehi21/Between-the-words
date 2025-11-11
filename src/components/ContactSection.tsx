import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

export function ContactSection() {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !userMessage) return;

    setLoading(true);
    setStatusMessage('');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          email,
          name,
          message: userMessage
        }]);

      if (error) {
        throw error;
      } else {
        setStatusMessage(language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message sent successfully!');
        setEmail('');
        setName('');
        setUserMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage(language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h2 className={`text-4xl font-bold mb-4 text-amber-100 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('contact.title')}
          </h2>
          <p className={`text-xl text-amber-200 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'نحن نحب أن نسمع منك' : 'We\'d love to hear from you'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-amber-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-amber-500/30">
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('contact.name')}
                className={`w-full px-6 py-4 bg-slate-800/70 text-amber-50 placeholder-amber-300/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${
                  language === 'ar' ? 'text-right font-arabic' : ''
                }`}
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('contact.email')}
                className={`w-full px-6 py-4 bg-slate-800/70 text-amber-50 placeholder-amber-300/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${
                  language === 'ar' ? 'text-right font-arabic' : ''
                }`}
                required
              />
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder={t('contact.message')}
                rows={5}
                className={`w-full px-6 py-4 bg-slate-800/70 text-amber-50 placeholder-amber-300/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none ${
                  language === 'ar' ? 'text-right font-arabic' : ''
                }`}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                <Send className="w-5 h-5" />
                {loading
                  ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                  : t('contact.send')}
              </button>
            </div>

            {statusMessage && (
              <div className={`mt-4 p-4 rounded-lg ${
                statusMessage.includes('success') || statusMessage.includes('نجاح')
                  ? 'bg-green-500/20 text-green-100 border border-green-500/30'
                  : 'bg-red-500/20 text-red-100 border border-red-500/30'
              }`}>
                {statusMessage}
              </div>
            )}
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className={`text-amber-200 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {language === 'ar'
              ? 'للتواصل المباشر: betweenthewords20@gmail.com'
              : 'Direct contact: betweenthewords20@gmail.com'}
          </p>
        </div>
      </div>
    </section>
  );
}
