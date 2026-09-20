import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '@hooks/useCart';
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
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-line">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.svg" alt="Doodle Room" className="h-10 w-auto md:h-12" />
            <div className="hidden sm:block">
              <span className="text-xl md:text-2xl font-display font-bold text-ink leading-none block">
                Doodle Room
              </span>
              <span className="text-[10px] md:text-xs text-muted font-body tracking-wider uppercase">
                Small Books Big Dreams
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-ink font-medium text-sm tracking-wide
                  after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
                  after:bg-terracotta after:transition-all after:duration-300
                  hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors"
              aria-label="بحث"
            >
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

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell />
            <Link to="/cart" className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink" aria-label="سلة التسوق">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-paper">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="w-10 h-10 rounded-full flex items-center justify-center text-ink" aria-label="القائمة">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="hidden lg:block pb-4 animate-slide-down">
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); }} className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن منتجات..."
                className="w-full pl-12 pr-4 py-3 bg-cream border-2 border-line rounded-full focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all text-ink placeholder:text-muted" autoFocus />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-ink/30 z-40" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-paper z-50 shadow-xl overflow-y-auto animate-slide-left">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <img src="/logo.svg" alt="Doodle Room" className="h-10 w-auto" />
                <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1 mb-8">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href}
                    className="block py-3 px-4 text-ink font-medium rounded-xl hover:bg-cream transition-colors"
                    onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileOpen(false); } }} className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث..."
                    className="w-full pl-12 pr-4 py-3 bg-cream border-2 border-line rounded-full focus:outline-none focus:border-terracotta transition-all" />
                </div>
              </form>
              <div className="space-y-2 border-t border-line pt-4">
                <Link to="/account" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-cream transition-colors" onClick={() => setMobileOpen(false)}>
                  <User className="w-5 h-5 text-terracotta" /><span className="font-medium">حسابي</span>
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-cream transition-colors" onClick={() => setMobileOpen(false)}>
                  <Heart className="w-5 h-5 text-terracotta" /><span className="font-medium">المفضلة</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
