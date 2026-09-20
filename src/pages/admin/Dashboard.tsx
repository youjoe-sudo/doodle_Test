import { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { ShoppingCart, Package, Users, LifeBuoy, TrendingUp, Clock } from 'lucide-react';

type Stats = {
  totalOrders: number;
  pendingPayments: number;
  revenue: number;
  totalProducts: number;
  totalCustomers: number;
  openTickets: number;
  recentOrders: Array<any>;
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, pendingPayments: 0, revenue: 0,
    totalProducts: 0, totalCustomers: 0, openTickets: 0, recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [orders, products, customers, tickets, recent] = await Promise.all([
          supabase.from('orders').select('id, total, status, payment_status'),
          supabase.from('products').select('id, stock'),
          supabase.from('profiles').select('id').eq('role', 'customer'),
          supabase.from('support_tickets').select('id').eq('status', 'OPEN'),
          supabase.from('orders').select('id, full_name, total, status, payment_status, created_at').order('created_at', { ascending: false }).limit(5),
        ]);
        setStats({
          totalOrders: orders.data?.length || 0,
          pendingPayments: orders.data?.filter((o) => o.payment_status === 'PENDING').length || 0,
          revenue: orders.data?.filter((o) => o.payment_status === 'APPROVED').reduce((s, o) => s + (o.total || 0), 0) || 0,
          totalProducts: products.data?.length || 0,
          lowStock: products.data?.filter((p) => p.stock <= 3).length || 0,
          totalCustomers: customers.data?.length || 0,
          openTickets: tickets.data?.length || 0,
          recentOrders: recent.data || [],
        } as any);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  const cards = [
    { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-terracotta' },
    { label: 'طلبات معلقة', value: stats.pendingPayments, icon: Clock, color: 'bg-amber-500' },
    { label: 'الإيرادات', value: `${stats.revenue.toLocaleString()} EGP`, icon: TrendingUp, color: 'bg-sage' },
    { label: 'المنتجات', value: stats.totalProducts, icon: Package, color: 'bg-blush' },
    { label: 'العملاء', value: stats.totalCustomers, icon: Users, color: 'bg-sky-500' },
    { label: 'تذاكر دعم مفتوحة', value: stats.openTickets, icon: LifeBuoy, color: 'bg-red-500' },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING_PAYMENT_VERIFICATION: 'bg-amber-100 text-amber-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PENDING_PAYMENT_VERIFICATION: 'بانتظار الدفع',
      PROCESSING: 'قيد المعالجة',
      SHIPPED: 'تم الشحن',
      DELIVERED: 'تم التوصيل',
      CANCELLED: 'ملغي',
    };
    return map[status] || status;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>لوحة التحكم</h2>
        <p className="text-muted mt-1">مرحباً بك في لوحة إدارة Doodle Room</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white border-2 border-line rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white border-2 border-line rounded-2xl p-5 shadow-[4px_4px_0px_0px_#E2E8F0] hover:shadow-[6px_6px_0px_0px_#E2E8F0] transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wide">{card.label}</p>
                      <p className="text-2xl font-bold text-ink mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{card.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#1E293B]`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Orders */}
          <div className="bg-white border-2 border-line rounded-2xl shadow-[4px_4px_0px_0px_#E2E8F0]">
            <div className="px-6 py-4 border-b-2 border-line">
              <h3 className="font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>آخر الطلبات</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-line bg-cream/30">
                    <th className="px-6 py-3 text-right text-xs font-bold text-ink uppercase">العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-ink uppercase">المبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-ink uppercase">حالة الطلب</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-ink uppercase">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">لا توجد طلبات بعد</td></tr>
                  ) : stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-line last:border-0 hover:bg-cream/20">
                      <td className="px-6 py-3 font-medium text-ink">{order.full_name || 'غير معروف'}</td>
                      <td className="px-6 py-3">{order.total?.toLocaleString()} EGP</td>
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusBadge(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
