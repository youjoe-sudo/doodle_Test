import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Box, Users, UserCog, Star,
  LifeBuoy, Truck, CreditCard, Settings, LogOut, Ticket, Menu, X, Bell, Palette,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/categories', icon: Tags, label: 'التصنيفات' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'الطلبات' },
  { to: '/admin/inventory', icon: Box, label: 'المخزون' },
  { to: '/admin/customers', icon: Users, label: 'العملاء' },
  { to: '/admin/users', icon: UserCog, label: 'إدارة المستخدمين' },
  { to: '/admin/coupons', icon: Ticket, label: 'الكوبونات' },
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

  const isActive = (link: typeof sidebarLinks[0]) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b-2 border-line">
        <Link to="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <img src="/logo.jpg" alt="Doodle Room" className="w-10 h-10 object-contain rounded-md" />
          <div>
            <h1 className="font-bold text-ink leading-none text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Doodle Room</h1>
            <p className="text-[11px] text-muted">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-terracotta text-white shadow-[2px_2px_0px_0px_#1E293B]'
                  : 'text-muted hover:text-ink hover:bg-cream'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t-2 border-line space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink hover:bg-cream transition-colors"
        >
          <Truck className="w-5 h-5" />
          العودة للمتجر
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل خروج
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-paper border-l-2 border-line flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-paper border-l-2 border-line flex flex-col animate-slide-left">
            <div className="flex items-center justify-between p-4 border-b-2 border-line">
              <span className="font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>القائمة</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-cream">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-paper border-b-2 border-line p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-cream">
              <Menu className="w-6 h-6 text-ink" />
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Doodle Room" className="w-10 h-10 object-contain rounded-md" />
              <span className="font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>Admin</span>
            </Link>
            <Link to="/" className="text-sm text-muted hover:text-ink">المتجر</Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
