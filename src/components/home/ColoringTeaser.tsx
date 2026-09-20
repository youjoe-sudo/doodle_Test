import { Link } from 'react-router-dom';
import { Paintbrush, ArrowLeft, Palette, Sparkles } from 'lucide-react';
import { useInView } from '@hooks/useInView';

export const ColoringTeaser = () => {
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="section-padding bg-cream/50" ref={ref}>
      <div className="container-wide">
        <Link to="/coloring-online" className="block group">
          <div className={`relative bg-gradient-to-br from-sage/15 via-paper to-blush/15
            rounded-3xl border-2 border-line overflow-hidden
            transition-all duration-700 group-hover:shadow-primary group-hover:border-terracotta/30
            ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Decorative background */}
            <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-terracotta/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-sage/10 rounded-full translate-y-1/3 -translate-x-1/4" />

            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-14">
              {/* Interactive visual */}
              <div className="relative shrink-0">
                {/* Main icon container */}
                <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-3xl border-2 border-line
                  flex items-center justify-center shadow-card
                  transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-card-hover">
                  <Paintbrush className="w-14 h-14 md:w-18 md:h-18 text-terracotta transition-transform duration-500 group-hover:scale-110" />
                </div>

                {/* Floating color dots */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-terracotta/80 animate-float shadow-sm" />
                <div className="absolute -bottom-2 -left-4 w-6 h-6 rounded-full bg-sage animate-float shadow-sm" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 -right-6 w-5 h-5 rounded-full bg-blush animate-float shadow-sm" style={{ animationDelay: '1s' }} />
              </div>

              {/* Text */}
              <div className="text-center md:text-right flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terracotta/10 rounded-full mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                  <span className="text-xs font-body text-terracotta font-medium">Available Now - Free</span>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-ink mb-3">
                  Online <span className="text-terracotta">Coloring</span> & Doodles
                </h3>
                <p className="text-muted font-body max-w-lg mb-6 leading-relaxed">
                  ابدأ التلوين الآن مباشرة من متصفحك! رسومات حصرية، أدوات احترافية، وألوان لا نهائية.
                  شارك إبداعاتك مع مجتمعنا.
                </p>

                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <span className="btn-primary group/btn text-sm">
                    ابدأ التلوين
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover/btn:-translate-x-1" />
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <Palette className="w-4 h-4 text-terracotta" />
                    <span>200+ رسمة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};
