import { Feather, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function AboutSection() {
  const { language, t } = useLanguage();

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold text-amber-100 mb-2 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('about.title')}
          </h2>
          <p className={`text-2xl text-amber-300 font-semibold mb-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
            {t('about.author')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-amber-900/50 to-orange-900/50 shadow-2xl overflow-hidden border border-amber-500/30 backdrop-blur-sm">
              <div className="w-full h-full flex items-center justify-center">
                <Feather className="w-32 h-32 text-amber-400 opacity-60" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-orange-500 rounded-full opacity-20 blur-2xl"></div>
          </div>

          <div className="space-y-6">
            <p className={`text-lg text-amber-50 leading-relaxed ${language === 'ar' ? 'font-arabic text-right' : ''}`}>
              {t('about.bio')}
            </p>

            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-900/40 to-slate-900/40 rounded-xl border border-amber-500/30 backdrop-blur-sm hover:border-amber-400/60 transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                  <Heart className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className={`font-semibold text-amber-100 mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {language === 'ar' ? 'قصص تلامس القلب' : 'Stories That Touch Hearts'}
                  </h3>
                  <p className={`text-sm text-amber-200/80 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {language === 'ar'
                      ? 'كل قصة مكتوبة بعمق وشغف لتترك أثراً في القارئ'
                      : 'Each story is crafted with depth and passion to leave a lasting impact'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-amber-900/40 to-slate-900/40 rounded-xl border border-amber-500/30 backdrop-blur-sm hover:border-amber-400/60 transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                  <Sparkles className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className={`font-semibold text-amber-100 mb-1 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {language === 'ar' ? 'جسر بين الثقافات' : 'Bridge Between Cultures'}
                  </h3>
                  <p className={`text-sm text-amber-200/80 ${language === 'ar' ? 'font-arabic' : ''}`}>
                    {language === 'ar'
                      ? 'أعمال تربط بين الثقافات المختلفة وتحتفي بالتنوع'
                      : 'Works that connect different cultures and celebrate diversity'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
