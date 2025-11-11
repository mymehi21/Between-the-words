import { ContactSection } from '../components/ContactSection';

export function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Warm inviting background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          filter: 'brightness(0.3)'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-amber-950/92 to-slate-800/95"></div>

      {/* Subtle atmospheric effects */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-20 right-20 w-72 h-72 bg-amber-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-32 w-64 h-64 bg-orange-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <ContactSection />
      </div>
    </div>
  );
}
