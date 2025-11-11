import { AboutSection } from '../components/AboutSection';

export function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Elegant literary background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1106468/pexels-photo-1106468.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          filter: 'brightness(0.35)'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 via-amber-900/90 to-slate-900/95"></div>

      {/* Soft ambient glow */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <AboutSection />
      </div>
    </div>
  );
}
