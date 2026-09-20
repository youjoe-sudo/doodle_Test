import { Paintbrush, ArrowLeft } from 'lucide-react';

export const ColoringBanner = () => {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <a href="/coloring-online" className="block group">
          <div className="relative bg-gradient-to-br from-sage/20 via-cream to-blush/20
            rounded-3xl border-2 border-line overflow-hidden
            transition-all duration-300 group-hover:shadow-primary group-hover:border-terracotta/30">

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-terracotta/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-sage/10 rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="dot-pattern absolute inset-0 opacity-20" />

            <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
              {/* Icon area */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl border-2 border-line
                flex items-center justify-center shrink-0 shadow-card
                transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Paintbrush className="w-12 h-12 md:w-16 md:h-16 text-terracotta" />
              </div>

              {/* Text */}
              <div className="text-center md:text-right flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terracotta/10 rounded-full mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                  <span className="text-xs font-body text-terracotta font-medium">Available Now</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-ink mb-2">
                  Online <span className="text-terracotta">Coloring</span>
                </h3>
                <p className="text-muted font-body max-w-md">
                  ابدأ التلوين الآن مباشرة من متصفحك! أدوات احترافية ورسومات حصرية.
                </p>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                <div className="btn-primary group/btn text-sm">
                  ابدأ التلوين
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover/btn:-translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
};
