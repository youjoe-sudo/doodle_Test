import { Link } from 'react-router-dom';
import { BookOpen, BookA, PenTool, Gift } from 'lucide-react';
import { useInView } from '@hooks/useInView';

const categories = [
  {
    icon: BookA,
    nameAr: 'كتب عربية',
    nameEn: 'Arabic Books',
    count: '120+ كتاب',
    color: 'from-terracotta/10 to-terracotta/5',
    iconColor: 'text-terracotta',
    borderColor: 'hover:border-terracotta/40',
  },
  {
    icon: BookOpen,
    nameAr: 'كتب إنجليزية',
    nameEn: 'English Books',
    count: '200+ كتاب',
    color: 'from-sage/15 to-sage/5',
    iconColor: 'text-sage-dark',
    borderColor: 'hover:border-sage/40',
  },
  {
    icon: PenTool,
    nameAr: 'أدوات مكتبية',
    nameEn: 'Stationery',
    count: '80+ منتج',
    color: 'from-blush/30 to-blush/10',
    iconColor: 'text-terracotta-dark',
    borderColor: 'hover:border-blush',
  },
  {
    icon: Gift,
    nameAr: 'هدايا و Doodles',
    nameEn: 'Gifts & Doodles',
    count: '50+ منتج',
    color: 'from-terracotta/8 to-blush/10',
    iconColor: 'text-terracotta',
    borderColor: 'hover:border-terracotta/30',
  },
];

export const CategoriesSection = () => {
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="section-padding bg-cream/50" ref={ref}>
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-14">
          <span className={`inline-block text-sm font-body text-terracotta font-medium tracking-wider uppercase mb-3 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Browse by Category
          </span>
          <h3 className={`text-3xl md:text-4xl font-display font-bold text-ink transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            تصفح <span className="text-terracotta">التصنيفات</span>
          </h3>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.nameEn}
                to="/categories"
                className={`group relative bg-white border-2 border-line rounded-2xl p-6 md:p-8 text-center
                  shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 hover:rotate-[-1deg]
                  ${cat.borderColor}
                  ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                {/* Icon */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-4
                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon className={`w-7 h-7 md:w-8 md:h-8 ${cat.iconColor}`} />
                </div>

                {/* Text */}
                <h4 className="font-display font-bold text-ink text-sm md:text-base mb-1">{cat.nameAr}</h4>
                <p className="text-xs text-muted font-body">{cat.count}</p>

                {/* Hover arrow */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
