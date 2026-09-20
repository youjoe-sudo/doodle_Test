import { Palette, PenTool, BookOpen } from 'lucide-react';

const tips = [
  { icon: Palette, title: 'اختر الورقة المناسبة', desc: 'لا جميع الورق متساوي' },
  { icon: PenTool, title: 'جرب أنواعاً مختلفة', desc: 'الأقلام، الألوان، الألوان المائية' },
  { icon: BookOpen, title: 'اجعلها عادة', desc: 'التلوين اليومي يعزز الإبداع' },
];

export const EditorialSection = () => {
  return (
    <section className="section-padding bg-cream/50">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Tips */}
          <div>
            <span className="inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3">
              Coloring Guide
            </span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-ink mb-8">
              تعليمات <span className="text-terracotta">الملونة</span>
            </h3>

            <div className="space-y-6">
              {tips.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-terracotta/10 rounded-2xl flex items-center justify-center shrink-0
                      transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="w-6 h-6 text-terracotta" />
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h4 className="font-display font-bold text-ink">{tip.title}</h4>
                      </div>
                      <p className="text-sm text-muted font-body">{tip.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote / Highlight */}
          <div className="flex flex-col justify-center">
            <div className="sticker-card p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blush/30 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="text-6xl text-terracotta/20 font-display leading-none mb-4">"</div>
                <blockquote className="text-xl md:text-2xl font-display font-bold text-ink leading-relaxed mb-6">
                  التلوين ليس للأطفال فقط - إنه للطامحين بقلوب صغيرة
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-terracotta/10 rounded-full flex items-center justify-center">
                    <span className="font-display font-bold text-terracotta text-sm">DR</span>
                  </div>
                  <div>
                    <p className="font-display font-bold text-ink text-sm">فريق دودل روم</p>
                    <p className="text-xs text-muted font-body">Doodle Room Team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
