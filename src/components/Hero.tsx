import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onExploreBooks: () => void;
}

export function Hero({ onExploreBooks }: HeroProps) {
  const { language, t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          filter: 'brightness(0.3)'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 z-10">
        <div className="mb-8">
          <div className="inline-block">
            <h1 className={`text-5xl sm:text-7xl font-bold mb-2 text-white drop-shadow-2xl ${
              language === 'ar' ? 'font-arabic' : ''
            }`}>
              {t('hero.title')}
            </h1>
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-4 shadow-lg"></div>
            <p className={`text-2xl sm:text-3xl font-semibold text-amber-400 drop-shadow-lg ${
              language === 'ar' ? 'font-arabic' : ''
            }`}>
              {t('hero.author')}
            </p>
          </div>
        </div>

        <p className={`text-xl sm:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md ${
          language === 'ar' ? 'font-arabic' : ''
        }`}>
          {t('hero.subtitle')}
        </p>

        <button
          onClick={onExploreBooks}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-700 to-orange-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {t('hero.cta')}
          <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
            language === 'ar' ? 'rotate-180' : ''
          }`} />
        </button>

        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-200">
            <div className="text-4xl font-bold text-amber-400 mb-2">2+</div>
            <div className="text-sm text-gray-200">
              {language === 'ar' ? 'كتب منشورة' : 'Published Books'}
            </div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-200">
            <div className="text-4xl font-bold text-amber-400 mb-2">1000+</div>
            <div className="text-sm text-gray-200">
              {language === 'ar' ? 'قراء' : 'Readers'}
            </div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20 hover:transform hover:-translate-y-1 transition-all duration-200">
            <div className="text-4xl font-bold text-amber-400 mb-2">5★</div>
            <div className="text-sm text-gray-200">
              {language === 'ar' ? 'تقييمات' : 'Ratings'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
