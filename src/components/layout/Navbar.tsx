import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, X, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@contexts/AuthContext';
import { NotificationBell } from '@components/notifications/NotificationBell';

const navLinks = [
  { href: '/shop', label: 'المتجر' },
  { href: '/categories', label: 'التصنيفات' },
  { href: '/coloring-online', label: 'التلوين' },
  { href: '/about', label: 'قصتنا' },
  { href: '/contact', label: 'اتصل بنا' },
];

export const Navbar = () => {
  const { cartCount } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = profile?.role === 'superadmin' || profile?.role === 'admin';

  // Close drawer on escape key
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
      {/* ===== DESKTOP HEADER (lg+) ===== */}
      <header className="hidden lg:block sticky top-0 z-[100] w-full bg-paper/95 backdrop-blur-md border-b border-line shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' } as React.CSSProperties}>
        <div className="container-wide">
          <div className="flex items-center justify-between min-h-[70px] py-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/logo.jpg" alt="Doodle Room" className="h-12 object-contain rounded-md" />
              <div>
                <span className="text-2xl font-display font-bold text-ink leading-none block">
                  Doodle Room
                </span>
                <span className="text-xs text-muted font-body tracking-wider uppercase">
                  Small Books Big Dreams
                </span>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href}
                  className="relative text-ink font-medium text-sm tracking-wide
                    after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
                    after:bg-terracotta after:transition-all after:duration-300
                    hover:after:w-full">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 bg-terracotta text-white text-sm font-bold rounded-xl border-2 border-ink shadow-[2px_2px_0px_0px_#1E293B] hover:shadow-[3px_3px_0px_0px_#1E293B] hover:-translate-y-0.5 transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </Link>
              )}
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors" aria-label="بحث">
                <Search className="w-5 h-5" />
              </button>
              <NotificationBell />
              <Link to="/wishlist" className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors" aria-label="المفضلة">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors" aria-label="سلة التسوق">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-paper">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/account" className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors" aria-label="حسابي">
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Desktop Search Bar */}
          {searchOpen && (
            <div className="pb-4 animate-slide-down">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); }} className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن منتجات..."
                  className="w-full pl-12 pr-4 py-3 bg-cream border-2 border-line rounded-full focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all text-ink placeholder:text-muted" autoFocus />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* ===== MOBILE: Floating Side-Arrow Trigger ===== */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-1/2 -translate-y-1/2 right-0 z-[90] flex items-center justify-center w-10 h-14 bg-paper border-2 border-line border-r-0 rounded-l-xl shadow-[−4px_4px_0px_0px_#E2E8F0] hover:bg-cream hover:border-terracotta transition-all active:scale-95"
        aria-label="فتح القائمة"
        style={{ boxShadow: '-4px 4px 0px 0px #E2E8F0' } as React.CSSProperties}
      >
        <ChevronLeft className="w-5 h-5 text-ink" />
      </button>

      {/* ===== MOBILE: Slim Top Bar (cart + bell only) ===== */}
      <div className="lg:hidden sticky top-0 z-[95] w-full bg-paper/95 backdrop-blur-md border-b border-line"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' } as React.CSSProperties}>
        <div className="flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.jpg" alt="Doodle Room" className="h-8 w-auto object-contain rounded-md" />
            <span className="text-sm font-display font-bold text-ink">Doodle Room</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link to="/cart" className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink" aria-label="سلة التسوق">
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-paper">
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
          {/* Backdrop */}
          <div className="fixed inset-0 bg-ink/40 z-[100] backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-paper z-[110] shadow-2xl overflow-y-auto animate-slide-left">
            <div className="p-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <img src="/logo.jpg" alt="Doodle Room" className="h-10 w-auto object-contain rounded-md" />
                  <div>
                    <span className="text-lg font-display font-bold text-ink leading-none block">Doodle Room</span>
                    <span className="text-[10px] text-muted tracking-wider uppercase">Small Books Big Dreams</span>
                  </div>
                </Link>
                <button onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream border-2 border-line hover:border-terracotta transition-all">
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>

              {/* Search */}
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileOpen(false); } }} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث..."
                    className="w-full pl-12 pr-4 py-3 bg-cream border-2 border-line rounded-full focus:outline-none focus:border-terracotta transition-all text-sm" />
                </div>
              </form>

              {/* Nav Links */}
              <nav className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href}
                    className="block py-3 px-4 text-ink font-medium rounded-xl hover:bg-cream transition-colors"
                    onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="border-t border-line my-4" />

              {/* Quick Actions */}
              <div className="space-y-2">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-terracotta text-white font-bold transition-colors shadow-[2px_2px_0px_0px_#1E293B]">
                    <LayoutDashboard className="w-5 h-5" /><span>لوحة التحكم</span>
                  </Link>
                )}
                <Link to="/account" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-cream transition-colors" onClick={() => setMobileOpen(false)}>
                  <User className="w-5 h-5 text-terracotta" /><span className="font-medium">حسابي</span>
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-cream transition-colors" onClick={() => setMobileOpen(false)}>
                  <Heart className="w-5 h-5 text-terracotta" /><span className="font-medium">المفضلة</span>
                </Link>
                <Link to="/cart" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-cream transition-colors" onClick={() => setMobileOpen(false)}>
                  <ShoppingCart className="w-5 h-5 text-terracotta" />
                  <span className="font-medium">سلة التسوق</span>
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
