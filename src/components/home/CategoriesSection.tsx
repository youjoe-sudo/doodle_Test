import { Link } from 'react-router-dom';
import { Flower2, ArrowRight, BookOpen, Palette, Sticker, PenTool } from 'lucide-react';
import { useLanguage } from '@components/layout/LanguageSwitcher';

const categoryCards = [
  { key: 'coloring_books', icon: BookOpen, bg: '#FBE3E5', ar: 'كتب التلوين', en: 'Coloring Books' },
  { key: 'coloring_supplies', icon: Palette, bg: '#E4EFE7', ar: 'مستلزمات التلوين', en: 'Coloring Supplies' },
  { key: 'stickers', icon: Sticker, bg: '#ECE5F5', ar: 'ستيكرز', en: 'Stickers' },
  { key: 'pencil_cases', icon: PenTool, bg: '#F9EAE1', ar: 'أقلام رصاص', en: 'Pencil Cases' },
];

export const CategoriesSection = () => {
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  return (
    <section className="py-16" style={{ backgroundColor: '#F9F6F0' }}>
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Flower2 className="w-6 h-6" style={{ color: '#C25350' }} />
          <h3 className="text-2xl md:text-3xl font-display font-bold" style={{ color: '#2C1E1B' }}>
            {t('تسوق حسب التصنيف', 'Shop by Category')}
          </h3>
        </div>

        {/* 4-Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.key} to="/categories"
                className="group rounded-2xl overflow-hidden transition-transform hover:-translate-y-2 hover:shadow-lg"
                style={{ backgroundColor: cat.bg }}>
                <div className="p-6 flex flex-col items-center justify-center min-h-[180px]">
                  <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <Icon className="w-8 h-8" style={{ color: '#C25350' }} />
                  </div>
                </div>
                {/* Footer with → arrow */}
                <div className="px-5 py-4 bg-white/60 backdrop-blur-sm flex items-center justify-between">
                  <span className="font-display font-bold text-sm" style={{ color: '#2C1E1B' }}>
                    {t(cat.ar, cat.en)}
                  </span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                    style={{ backgroundColor: '#C25350' }}
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
