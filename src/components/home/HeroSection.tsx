import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

/* Floating particle component */
const FloatingParticle = ({ className, delay }: { className: string; delay: string }) => (
  <div className={`absolute rounded-full opacity-40 animate-float ${className}`} style={{ animationDelay: delay }} />
);

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background decorative particles */}
      <FloatingParticle className="w-3 h-3 bg-terracotta/30 top-[10%] left-[5%]" delay="0s" />
      <FloatingParticle className="w-2 h-2 bg-sage/40 top-[20%] right-[10%]" delay="0.5s" />
      <FloatingParticle className="w-4 h-4 bg-blush/40 top-[60%] left-[8%]" delay="1s" />
      <FloatingParticle className="w-2.5 h-2.5 bg-terracotta/20 top-[70%] right-[15%]" delay="1.5s" />
      <FloatingParticle className="w-3 h-3 bg-sage/30 bottom-[15%] left-[20%]" delay="2s" />
      <FloatingParticle className="w-2 h-2 bg-blush/30 top-[40%] left-[30%]" delay="0.8s" />
      <FloatingParticle className="w-3.5 h-3.5 bg-terracotta/15 bottom-[30%] right-[25%]" delay="1.2s" />
      <FloatingParticle className="w-2 h-2 bg-sage/25 top-[15%] left-[45%]" delay="1.8s" />

      {/* Large decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blush/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sage/5 rounded-full blur-3xl" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      <div className="container-wide relative z-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1 text-center lg:text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta/10 rounded-full mb-6 opacity-0 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span className="text-sm font-body text-terracotta font-medium">New Collection 2026</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-ink leading-[1.1] mb-6 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Doodle Room
            </h1>
            <p className="text-xl md:text-2xl font-display text-terracotta italic mb-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              A cozy little corner for books, gifts & lovely little things
            </p>
            <p className="text-base md:text-lg text-muted font-body max-w-lg mx-auto lg:mx-0 mb-10 opacity-0 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              اكتشف عالمنا من الكتب العربية والإنجليزية، والأدوات الإبداعية، والهدايا المميزة.
              كل قطعة تروي قصة.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/shop" className="btn-primary group">
                تسوق الآن
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link to="/categories" className="btn-outline">
                اكتشف التصنيفات
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 justify-center lg:justify-start opacity-0 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              {[
                { value: '500+', label: 'كتاب' },
                { value: '10K+', label: 'عميل سعيد' },
                { value: '4.9', label: 'تقييم' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-display font-bold text-terracotta">{stat.value}</div>
                  <div className="text-xs text-muted font-body">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Showcase */}
          <div className="order-1 lg:order-2 relative flex justify-center">
            {/* Logo with floating animation */}
            <div className="relative opacity-0 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              {/* Glow ring */}
              <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-terracotta/10 via-blush/20 to-sage/10 blur-2xl animate-pulse" />

              {/* Main logo container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 animate-float">
                <img
                  src="/logo.jpg"
                  alt="Doodle Room Logo"
                  className="w-full h-full object-contain rounded-xl drop-shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fb = (e.target as HTMLImageElement).nextElementSibling;
                    if (fb) (fb as HTMLElement).style.display = 'flex';
                  }}
                />
                {/* Fallback */}
                <div className="w-full h-full bg-terracotta rounded-3xl items-center justify-center shadow-primary hidden">
                  <span className="text-white font-display font-bold text-8xl">D</span>
                </div>
              </div>

              {/* Floating book card */}
              <div className="absolute -top-4 -left-4 md:-top-6 md:-left-8 bg-white rounded-2xl p-3 shadow-card border border-line animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="w-16 h-20 md:w-20 md:h-24 bg-gradient-to-br from-terracotta/10 to-blush/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-terracotta/60" />
                </div>
                <p className="text-[10px] font-bold text-ink mt-1.5 text-center">Bestseller</p>
              </div>

              {/* Floating rating card */}
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-8 bg-white rounded-2xl p-3 shadow-card border border-line animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-terracotta" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs font-bold text-ink mt-1">10,000+ Reviews</p>
              </div>

              {/* Floating heart */}
              <div className="absolute top-1/2 -right-6 md:-right-12 w-10 h-10 bg-blush rounded-full flex items-center justify-center animate-float shadow-card" style={{ animationDelay: '1.5s' }}>
                <svg className="w-5 h-5 text-terracotta" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
