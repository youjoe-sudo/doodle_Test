import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, X, Menu, LayoutDashboard } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@contexts/AuthContext';
import { NotificationBell } from '@components/notifications/NotificationBell';
import { LanguageSwitcher, useLanguage } from '@components/layout/LanguageSwitcher';

const navLinks = [
  { href: '/shop', label: 'المتجر', labelEn: 'Shop' },
  { href: '/categories', label: 'التصنيفات', labelEn: 'Categories' },
  { href: '/coloring-online', label: 'التلوين', labelEn: 'Coloring' },
  { href: '/about', label: 'قصتنا', labelEn: 'Our Story' },
  { href: '/contact', label: 'اتصل بنا', labelEn: 'Contact' },
];

export const Navbar = () => {
  const { cartCount } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const lang = useLanguage();

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ===== DESKTOP HEADER — logo centered, utilities on sides ===== */}
      <header
        className="hidden lg:block sticky top-0 z-[100] w-full bg-paper/95 backdrop-blur-md border-b border-line"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' } as React.CSSProperties}
      >
        <div className="container-wide">
          <div className="relative flex items-center justify-between min-h-[88px] py-3">
            {/* Left: menu / admin */}
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={() => setMobileOpen(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-card transition-colors border-2 border-line"
                aria-label={t('فتح القائمة', 'Open menu')}
              >
                <Menu className="w-5 h-5" style={{ color: '#2C1E1B' }} />
              </button>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-dark transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('لوحة التحكم', 'Dashboard')}
                </Link>
              )}
            </div>

            {/* Center: logo ONLY */}
            <Link
              to="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center px-4 py-1"
              aria-label={t('الصفحة الرئيسية', 'Home')}
            >
              <img
                src="/logo.jpg"
                alt="Doodle Room"
                className="h-16 w-auto object-contain rounded-xl"
                style={{ boxShadow: '0 4px 0 0 rgba(44, 30, 27, 0.08)' }}
              />
            </Link>

            {/* Right: utilities */}
            <div className="flex items-center gap-2 z-10">
              <LanguageSwitcher />
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-card transition-colors"
                aria-label={t('بحث', 'Search')}
              >
                <Search className="w-5 h-5" style={{ color: '#2C1E1B' }} />
              </button>
              <NotificationBell />
              <Link
                to="/wishlist"
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-card transition-colors"
                aria-label={t('المفضلة', 'Wishlist')}
              >
                <Heart className="w-5 h-5" style={{ color: '#2C1E1B' }} />
              </Link>
              <Link
                to="/cart"
                className="relative w-11 h-11 rounded-full flex items-center justify-center hover:bg-card transition-colors"
                aria-label={t('سلة التسوق', 'Cart')}
              >
                <ShoppingCart className="w-5 h-5" style={{ color: '#2C1E1B' }} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/account"
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-card transition-colors"
                aria-label={t('حسابي', 'Account')}
              >
                <User className="w-5 h-5" style={{ color: '#2C1E1B' }} />
              </Link>
            </div>
          </div>

          {searchOpen && (
            <div className="pb-4 animate-slide-down">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                }}
                className="relative max-w-xl mx-auto"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('ابحث عن منتجات...', 'Search products...')}
                  className="w-full pl-12 pr-4 py-3 bg-card border-2 border-line rounded-full focus:outline-none focus:border-terracotta transition-all"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ===== MOBILE: Slim Top Bar — logo centered ===== */}
      <div
        className="lg:hidden sticky top-0 z-[95] w-full bg-paper/95 backdrop-blur-md border-b border-line"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' } as React.CSSProperties}
      >
        <div className="relative flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center z-10"
            aria-label={t('فتح القائمة', 'Open menu')}
          >
            <Menu className="w-5 h-5" style={{ color: '#2C1E1B' }} />
          </button>
          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            aria-label={t('الصفحة الرئيسية', 'Home')}
          >
            <img src="/logo.jpg" alt="Doodle Room" className="h-11 w-auto object-contain rounded-lg" />
          </Link>
          <div className="flex items-center gap-1 z-10">
            <LanguageSwitcher />
            <Link
              to="/cart"
              className="relative w-10 h-10 rounded-full flex items-center justify-center"
              aria-label={t('سلة التسوق', 'Cart')}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: '#2C1E1B' }} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ===== MOBILE: Slide-Out Drawer ===== */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-ink/40 z-[100] backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-paper z-[110] shadow-2xl overflow-y-auto animate-slide-left">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <img src="/logo.jpg" alt="Doodle Room" className="h-10 w-auto object-contain rounded-md" />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-card border-2 border-line transition-all"
                >
                  <X className="w-5 h-5" style={{ color: '#2C1E1B' }} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setMobileOpen(false);
                  }
                }}
                className="mb-6"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('ابحث...', 'Search...')}
                    className="w-full pl-12 pr-4 py-3 bg-card border-2 border-line rounded-full focus:outline-none focus:border-terracotta transition-all text-sm"
                  />
                </div>
              </form>

              <nav className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block py-3 px-4 font-medium rounded-xl hover:bg-card transition-colors"
                    style={{ color: '#2C1E1B' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(link.label, link.labelEn)}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-line my-4" />

              <div className="space-y-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-terracotta text-white font-bold transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>{t('لوحة التحكم', 'Dashboard')}</span>
                  </Link>
                )}
                <Link
                  to="/account"
                  className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-card transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="w-5 h-5 text-terracotta" />
                  <span className="font-medium">{t('حسابي', 'Account')}</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-card transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Heart className="w-5 h-5 text-terracotta" />
                  <span className="font-medium">{t('المفضلة', 'Wishlist')}</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-card transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5 text-terracotta" />
                  <span className="font-medium">{t('سلة التسوق', 'Cart')}</span>
                  {cartCount > 0 && (
                    <span className="mr-auto px-2 py-0.5 bg-terracotta text-white text-xs font-bold rounded-full">{cartCount}</span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
