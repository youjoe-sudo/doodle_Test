import { Link } from 'react-router-dom';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

const fmtOrderNumber = (id: string) => `ORD-${id.slice(0, 8).toUpperCase()}`;

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT_VERIFICATION: 'بانتظار الدفع', PROCESSING: 'قيد المعالجة',
  SHIPPED: 'تم الشحن', DELIVERED: 'تم التوصيل', CANCELLED: 'ملغي',
  PAYMENT_REJECTED: 'الدفع مرفوض',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'معلق', APPROVED: 'مدفوع', REJECTED: 'مرفوض',
};

export const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchOrders();
  }, [user?.id]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-display ink text-terracotta mb-4">طلباتك</h2>
        <p className="text-muted">تاريخ طلباتك السابقة</p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <span className="animate-pulse inline-block h-64 w-32 bg-cream rounded-md"></span>
        </div>
      ) : (
        <div>
          {orders.length === 0 ? (
            <p className="text-center text-muted py-8">لم تقم بأي طلبات بعد</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-5 border-2 border-line bg-white rounded-2xl shadow-[4px_4px_0px_0px_#E2E8F0]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-ink">#{fmtOrderNumber(order.id)}</h4>
                      <p className="text-xs text-muted mt-0.5">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-terracotta font-bold block">{order.total?.toLocaleString()} EGP</span>
                      {order.discount > 0 && (
                        <span className="text-xs text-sage font-medium">خصم: -{order.discount.toLocaleString()} EGP</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      order.payment_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      order.payment_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                    </span>
                    <Link to={`/account/orders/${order.id}`}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta/10 text-terracotta text-xs font-bold rounded-full hover:bg-terracotta/20 transition-colors">
                      <Package className="w-3.5 h-3.5" /> تتبع الطلب
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
