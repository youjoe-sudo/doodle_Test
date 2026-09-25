import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import { useLanguage } from '@components/layout/LanguageSwitcher';

const tabs = [
  { to: '/', icon: Home, ar: 'الرئيسية', en: 'Home' },
  { to: '/categories', icon: LayoutGrid, ar: 'التصنيفات', en: 'Categories' },
  { to: '/cart', icon: ShoppingCart, ar: 'السلة', en: 'Cart' },
  { to: '/account', icon: MoreHorizontal, ar: 'المزيد', en: 'More' },
];

export const MobileNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const lang = useLanguage();
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] border-t border-line"
      style={{ backgroundColor: '#FDFBF7', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;
          return (
            <Link key={tab.to} to={tab.to}
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full relative"
              aria-label={t(tab.ar, tab.en)}
              aria-current={isActive ? 'page' : undefined}>
              <div className="relative">
                <Icon className="w-5 h-5"
                  style={{ color: isActive ? '#C25350' : '#5A4A42' }} />
                {tab.to === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 text-[8px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: '#C25350' }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? '#C25350' : '#5A4A42' }}>
                {t(tab.ar, tab.en)}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: '#C25350' }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};