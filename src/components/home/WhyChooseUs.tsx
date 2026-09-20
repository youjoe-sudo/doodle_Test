import { Truck, Gift, CreditCard, Shield, Headphones, RotateCcw } from 'lucide-react';
import { useInView } from '@hooks/useInView';

const features = [
  {
    icon: Truck,
    title: 'توصيل سريع',
    desc: 'شحن مجاني للطلبات فوق 500 ج.م',
    color: 'bg-terracotta/10 text-terracotta',
  },
  {
    icon: Gift,
    title: 'تغليف هدايا مميز',
    desc: 'تغليف أنيق مجاناً مع كل طلب',
    color: 'bg-blush/30 text-terracotta-dark',
  },
  {
    icon: CreditCard,
    title: 'دفع آمن',
    desc: 'فودافون كاش • إنستاباي • تحويل بنكي',
    color: 'bg-sage/15 text-sage-dark',
  },
  {
    icon: Shield,
    title: 'ضمان الجودة',
    desc: 'منتجات أصلية 100%',
    color: 'bg-terracotta/10 text-terracotta',
  },
  {
    icon: Headphones,
    title: 'دعم على مدار الساعة',
    desc: 'فريق خدمة العملاء جاهز لمساعدتك',
    color: 'bg-blush/30 text-terracotta-dark',
  },
  {
    icon: RotateCcw,
    title: 'إرجاع سهل',
    desc: 'إرجاع واستبدال خلال 14 يوم',
    color: 'bg-sage/15 text-sage-dark',
  },
];

export const WhyChooseUs = () => {
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-14">
          <span className={`inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Why Doodle Room
          </span>
          <h3 className={`text-3xl md:text-4xl font-display font-bold text-ink transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            ليه <span className="text-terracotta">تختارنا</span>؟
          </h3>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`group bg-white border-2 border-line rounded-2xl p-5 md:p-7 text-center
                  shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2
                  ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80 + 200}ms` }}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${feat.color} flex items-center justify-center mx-auto mb-4
                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h4 className="font-display font-bold text-ink text-sm md:text-base mb-1">{feat.title}</h4>
                <p className="text-xs md:text-sm text-muted font-body leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
