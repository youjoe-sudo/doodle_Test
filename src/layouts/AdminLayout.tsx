import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Box, Users, UserCog, Star,
  LifeBuoy, Truck, CreditCard, Settings, LogOut, Ticket, Menu, X, Bell, Palette,
  Image as ImageIcon, FileText,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
  { to: '/admin/banner-management', icon: ImageIcon, label: 'إدارة البانرات' },
  { to: '/admin/about-builder', icon: FileText, label: 'صفحة من نحن' },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/categories', icon: Tags, label: 'التصنيفات' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
  { to: '/admin/inventory', icon: Box, label: 'المخزون' },
  { to: '/admin/customers', icon: Users, label: 'العملاء' },
  { to: '/admin/users', icon: UserCog, label: 'إدارة المستخدمين' },
  { to: '/admin/coupons', icon: Ticket, label: 'الكوبونات' },
  { to: '/admin/reviews', icon: Star, label: 'التقييمات' },
  { to: '/admin/support', icon: LifeBuoy, label: 'الدعم' },
  { to: '/admin/shipping', icon: Truck, label: 'الشحن' },
  { to: '/admin/payments', icon: CreditCard, label: 'المدفوعات' },
  { to: '/admin/notifications', icon: Bell, label: 'الإشعارات' },
  { to: '/admin/coloring', icon: Palette, label: 'صفحات التلوين' },
  { to: '/admin/settings', icon: Settings, label: 'الإعدادات' },
];

export const AdminLayout = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (link: typeof sidebarLinks[0]) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b-2 border-line">
        <Link to="/admin" className="flex items-center gap-3 min-h-[48px]" onClick={() => setMobileOpen(false)}>
          <img src="/logo.jpg" alt="Doodle Room" className="w-10 h-10 object-contain rounded-md" />
          <div>
            <h1 className="font-bold text-ink leading-none text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Doodle Room</h1>
            <p className="text-[11px] text-muted">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 min-h-[48px] py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-terracotta text-white shadow-[2px_2px_0px_0px_#1E293B]'
                  : 'text-muted hover:text-ink hover:bg-cream'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t-2 border-line space-y-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-sm font-medium text-muted hover:text-ink hover:bg-cream transition-colors"
        >
          <Truck className="w-5 h-5" />
          العودة للمتجر
        </Link>
        <button
          onClick={() => {
            setMobileOpen(false);
            logout();
          }}
          className="w-full flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل خروج
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream flex overflow-x-hidden max-w-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-paper border-l-2 border-line flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile: full-screen overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[min(20rem,85vw)] bg-paper flex flex-col animate-slide-left border-l-2 border-line"
            data-testid="admin-mobile-drawer"
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-line shrink-0">
              <span className="font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>القائمة</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="min-w-[48px] min-h-[48px] rounded-xl hover:bg-cream flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-ink" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile sticky header */}
        <header className="lg:hidden bg-paper border-b-2 border-line px-3 py-2 sticky top-0 z-40">
          <div className="flex items-center justify-between gap-2 min-h-[48px]">
            <button
              onClick={() => setMobileOpen(true)}
              className="min-w-[48px] min-h-[48px] rounded-xl hover:bg-cream flex items-center justify-center"
              aria-label="Open admin menu"
              data-testid="admin-menu-trigger"
            >
              <Menu className="w-6 h-6 text-ink" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 min-h-[48px]">
              <img src="/logo.jpg" alt="Doodle Room" className="w-9 h-9 object-contain rounded-md" />
              <span className="font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>Admin</span>
            </Link>
            <Link
              to="/"
              className="min-h-[48px] px-3 flex items-center text-sm text-muted hover:text-ink rounded-xl"
            >
              المتجر
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 w-full max-w-full">
          <Outlet />
        </main>
      </div>

      {/* Accessible floating menu button (mobile) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-[110] min-w-[56px] min-h-[56px] rounded-full bg-terracotta text-white shadow-[4px_4px_0_0_#1E293B] flex items-center justify-center active:translate-y-0.5 transition-transform"
        aria-label="Open admin navigation"
        data-testid="admin-fab-menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
};
