import { ArrowLeft, Star, Truck, Heart } from 'lucide-react';

export const OurStorySection = () => {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-full h-full bg-blush/30 rounded-3xl" />
            <div className="relative bg-gradient-to-br from-cream via-paper to-terracotta/5
              rounded-3xl border-2 border-line p-8 md:p-12 overflow-hidden">
              <div className="absolute top-4 right-4 dot-pattern w-20 h-20 rounded-xl opacity-30" />
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-terracotta/5 to-blush/20
                flex items-center justify-center border border-line/50">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-terracotta/10 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-terracotta" />
                  </div>
                  <p className="text-muted font-body text-sm">Our Story</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3">
              Our Story
            </span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-ink mb-6">
              قصتنا <span className="text-terracotta">بدأت</span> هنا
            </h3>
            <p className="text-muted font-body leading-relaxed mb-8">
              تأسست دودل روم عام 2020 كمنطقة صغيرة للإبداع والتلوين. نؤمن أن الإبداع يبدأ من قلم بسيط
              ويزدهر في بيئة محفزة. هدفنا هو توفير أفضل مستلزمات التلوين والإبداع لعشاق الفن من كل الأعمار.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Star, title: 'جودة عالية', desc: 'نختار بعناية كل منتج' },
                { icon: Truck, title: 'شحن سريع', desc: 'نشحن إلى معظم الدول' },
                { icon: Heart, title: 'دعم متميز', desc: 'فريقنا هنا للمساعدة' },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div key={feat.title} className="text-center sm:text-left">
                    <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0">
                      <Icon className="w-5 h-5 text-terracotta" />
                    </div>
                    <h4 className="font-display font-bold text-ink text-sm mb-1">{feat.title}</h4>
                    <p className="text-xs text-muted font-body">{feat.desc}</p>
                  </div>
                );
              })}
            </div>

            <a href="/about" className="btn-primary group text-sm">
              اقرأ المزيد
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
