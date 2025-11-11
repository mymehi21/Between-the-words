import { BookOpen, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Footer() {
  const { language, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-amber-500" />
              <span className="text-xl font-semibold text-white">
                {language === 'ar' ? 'بين الكلمات' : 'Between the words'}
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar'
                ? 'منصة لنشر وبيع الكتب الأدبية التي تلامس القلوب وتتجاوز الحدود'
                : 'A platform for publishing and selling literary works that touch hearts and transcend boundaries'}
            </p>
          </div>

          <div>
            <h3 className={`text-white font-semibold mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-500 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-amber-500 transition-colors">
                  {t('nav.books')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-500 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-500 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-white font-semibold mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
              {language === 'ar' ? 'تابعنا' : 'Follow Us'}
            </h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:betweenthewords20@gmail.com"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm space-y-2">
          <p>
            © {currentYear} {language === 'ar' ? 'بين الكلمات' : 'Between the words'}. {t('footer.rights')}.
          </p>
          <p className="text-gray-500 text-xs">
            Powered by{' '}
            <a
              href="https://mxstudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 transition-colors font-semibold"
            >
              MX Studios
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
